import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { requireAuth } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    // 1. Verify Cloudinary credentials are set
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Cloudinary is not configured on the server. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = ((formData.get('folder') as string) || 'chord_and_craft').trim();

    // Restrict folder namespace to chord_and_craft/*; students may ONLY upload avatars
    const sanitizedFolder =
      session.role === 'admin'
        ? requestedFolder.startsWith('chord_and_craft') && !requestedFolder.includes('..')
          ? requestedFolder
          : 'chord_and_craft'
        : 'chord_and_craft/avatars';
    const folder = sanitizedFolder;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided for upload.' },
        { status: 400 }
      );
    }

    // 3. Validate MIME type (SVG/ICO restricted to Admin to prevent stored XSS by students)
    const studentMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/avif',
    ];
    const adminExtraMimeTypes = [
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/ico',
      'image/icon',
    ];
    const validMimeTypes =
      session.role === 'admin'
        ? [...studentMimeTypes, ...adminExtraMimeTypes]
        : studentMimeTypes;

    const isAllowedIco = session.role === 'admin' && file.name.endsWith('.ico');
    if (!validMimeTypes.includes(file.type) && !isAllowedIco) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type (${file.type || 'unknown'}).`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Image file size exceeds the 10MB limit.',
        },
        { status: 400 }
      );
    }

    // 5. Convert file to buffer and upload directly to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve(result);
          } else {
            reject(new Error('Cloudinary upload returned an empty response.'));
          }
        }
      );

      uploadStream.end(buffer);
    });

    // 6. Return Cloudinary URL strictly (No local fallback)
    return NextResponse.json(
      {
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'Failed to upload image to Cloudinary. No fallback storage used.',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper to extract the Cloudinary public_id from a full URL or identifier
 */
function extractCloudinaryPublicId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();

  // If already a public_id (no protocol)
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return trimmed.replace(/\.[^/.]+$/, '');
  }

  // Check if it's a Cloudinary URL
  if (!trimmed.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const urlObj = new URL(trimmed);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.findIndex((part) => part === 'upload');

    if (uploadIndex === -1) return null;

    let subParts = pathParts.slice(uploadIndex + 1);
    // Skip version prefix if present (e.g. v1234567890)
    if (subParts[0] && /^v\d+$/.test(subParts[0])) {
      subParts = subParts.slice(1);
    }

    const fullPathWithExt = subParts.join('/');
    // Strip file extension
    return fullPathWithExt.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

export async function DELETE(request: NextRequest) {
  const auth = requireAuth(request);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cloudinary is not configured on the server.',
        },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    let publicId = searchParams.get('public_id') || searchParams.get('publicId');
    const url = searchParams.get('url');

    if (!publicId && url) {
      publicId = extractCloudinaryPublicId(url);
    }

    if (!publicId) {
      try {
        const body = await request.json();
        publicId =
          body.publicId ||
          body.public_id ||
          (body.url ? extractCloudinaryPublicId(body.url) : null);
      } catch {
        // Body was empty or not JSON
      }
    }

    if (!publicId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Public ID or Cloudinary Image URL is required to delete an image.',
        },
        { status: 400 }
      );
    }

    // Scope deletions strictly to chord_and_craft/*; students may ONLY delete avatars
    const allowedPrefix =
      session.role === 'admin' ? 'chord_and_craft/' : 'chord_and_craft/avatars/';
    if (!publicId.startsWith(allowedPrefix) || publicId.includes('..')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot delete assets outside allowed scope.' },
        { status: 403 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      invalidate: true,
    });

    return NextResponse.json({
      success: true,
      result: result.result || 'ok',
      public_id: publicId,
    });
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to delete image from Cloudinary.',
      },
      { status: 500 }
    );
  }
}
