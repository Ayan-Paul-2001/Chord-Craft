import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import CmsSectionModel from '@/models/CmsSection';
import { MOCK_CMS_SECTIONS } from '@/lib/mockData';
import { requireAdmin } from '@/lib/authGuard';

interface CmsSectionDocLike {
  sectionKey?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  titleFont?: string;
  bodyFont?: string;
  enabled?: boolean;
  order?: number;
}

function serializeCmsSection(s: CmsSectionDocLike) {
  return {
    id: s.sectionKey || '',
    title: s.title || '',
    subtitle: s.subtitle || '',
    content: s.content || '',
    imageUrl: s.imageUrl || '',
    buttonText: s.buttonText || '',
    buttonLink: s.buttonLink || '',
    titleFont: s.titleFont || 'default',
    bodyFont: s.bodyFont || 'default',
    enabled: Boolean(s.enabled),
    order: Number(s.order || 0),
  };
}

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
};

async function ensureCmsSeeded() {
  const existing = (await CmsSectionModel.find({}, { sectionKey: 1 }).lean()) as unknown as Array<{
    sectionKey?: string;
  }>;
  const existingKeys = new Set(existing.map((s) => s.sectionKey).filter(Boolean));
  const missing = MOCK_CMS_SECTIONS.filter((s) => !existingKeys.has(s.id));

  if (missing.length > 0) {
    await CmsSectionModel.bulkWrite(
      missing.map((s) => ({
        updateOne: {
          filter: { sectionKey: s.id },
          update: {
            $setOnInsert: {
              sectionKey: s.id,
              title: s.title,
              subtitle: s.subtitle || '',
              content: s.content,
              imageUrl: s.imageUrl || '',
              buttonText: s.buttonText || '',
              buttonLink: s.buttonLink || '',
              titleFont: s.titleFont || 'default',
              bodyFont: s.bodyFont || 'default',
              enabled: s.enabled,
              order: s.order,
            },
          },
          upsert: true,
        },
      }))
    );
    console.log(`✅ Ensured ${missing.length} missing CMS sections in cms_sections collection`);
  }

  // Clean up earlier seeded sec-courses copy/order if it still carries old draft wording
  const coursesSec = (await CmsSectionModel.findOne({ sectionKey: 'sec-courses' }).lean()) as {
    content?: string;
    order?: number;
  } | null;
  if (coursesSec && typeof coursesSec.content === 'string' && /zero delivery fees/i.test(coursesSec.content)) {
    const targetCourses = MOCK_CMS_SECTIONS.find((s) => s.id === 'sec-courses');
    if (targetCourses) {
      await CmsSectionModel.updateOne(
        { sectionKey: 'sec-courses' },
        {
          $set: {
            content: targetCourses.content,
            buttonText: targetCourses.buttonText || 'Browse All Courses',
            buttonLink: targetCourses.buttonLink || '/courses',
            order: 6,
          },
        }
      );
      await CmsSectionModel.updateOne({ sectionKey: 'sec-process' }, { $set: { order: 4 } });
      await CmsSectionModel.updateOne({ sectionKey: 'sec-featured' }, { $set: { order: 5 } });
    }
  }
}

// GET /api/cms
export async function GET() {
  try {
    await connectToDatabase();
    await ensureCmsSeeded();

    const sections = (await CmsSectionModel.find()
      .sort({ order: 1 })
      .lean()) as unknown as CmsSectionDocLike[];

    return NextResponse.json(
      {
        success: true,
        cmsSections: sections.map(serializeCmsSection),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch CMS sections' },
      { status: 500 }
    );
  }
}

// PATCH /api/cms?key=sec-hero — Strictly Administrator only
export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    await ensureCmsSeeded();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'key param required' }, { status: 400 });

    const body = (await req.json()) as Record<string, unknown>;

    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText;
    if (body.buttonLink !== undefined) updateData.buttonLink = body.buttonLink;
    if (body.titleFont !== undefined) updateData.titleFont = body.titleFont;
    if (body.bodyFont !== undefined) updateData.bodyFont = body.bodyFont;
    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    if (body.order !== undefined) updateData.order = body.order;

    const section = (await CmsSectionModel.findOneAndUpdate(
      { sectionKey: key },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean()) as unknown as CmsSectionDocLike | null;

    if (!section) return NextResponse.json({ error: 'Section not found' }, { status: 404 });

    return NextResponse.json(
      {
        success: true,
        cmsSection: serializeCmsSection(section),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update CMS section' },
      { status: 500 }
    );
  }
}

// PUT /api/cms — Strictly Administrator only
export async function PUT(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    await ensureCmsSeeded();
    const body = (await req.json()) as { sections?: { id: string; order: number }[] };
    const items: { id: string; order: number }[] = Array.isArray(body?.sections) ? body.sections : [];

    if (items.length === 0) {
      return NextResponse.json({ error: 'sections array required' }, { status: 400 });
    }

    await CmsSectionModel.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { sectionKey: item.id },
          update: { $set: { order: Number(item.order) } },
        },
      }))
    );

    const sections = (await CmsSectionModel.find()
      .sort({ order: 1 })
      .lean()) as unknown as CmsSectionDocLike[];

    return NextResponse.json(
      {
        success: true,
        cmsSections: sections.map(serializeCmsSection),
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reorder CMS sections' },
      { status: 500 }
    );
  }
}
