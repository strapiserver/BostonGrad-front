#!/usr/bin/env node

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const [databasePath, outputPath] = process.argv.slice(2);
if (!databasePath || !outputPath) {
  throw new Error("Usage: export-static-content.js <data.db> <output.json>");
}

const query = (sql) => {
  const output = execFileSync("sqlite3", ["-json", databasePath, sql], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  }).trim();
  return output ? JSON.parse(output) : [];
};

const rows = (table) => query(`select * from ${table}`);
const asId = (value) => String(value);
const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const mediaRows = query(`
  select f.*
  from files f
  where f.id in (select distinct file_id from files_related_morphs)
`);
const mediaById = new Map(mediaRows.map((file) => [file.id, file]));
const morphs = rows("files_related_morphs");

const image = (file) =>
  file
    ? {
        id: asId(file.id),
        name: file.name || null,
        alternativeText: file.alternative_text || null,
        caption: file.caption || null,
        width: file.width || null,
        height: file.height || null,
        formats: parseJson(file.formats, null),
        url: file.url,
      }
    : null;

const mediaFor = (type, relatedId, field) =>
  morphs
    .filter(
      (morph) =>
        morph.related_type === type &&
        morph.related_id === relatedId &&
        morph.field === field,
    )
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((morph) => image(mediaById.get(morph.file_id)))
    .filter(Boolean);

const oneMedia = (type, relatedId, field) =>
  mediaFor(type, relatedId, field)[0] || null;

const articleRows = rows("articles");
const articlesById = new Map(articleRows.map((article) => [article.id, article]));
const relationMap = (table, ownerKey) =>
  new Map(rows(table).map((row) => [row[ownerKey], row.article_id]));

const uniArticles = relationMap("unis_article_links", "uni_id");
const productArticles = relationMap("products_article_links", "product_id");
const storyArticles = relationMap("stories_article_links", "story_id");
const visaArticles = relationMap("visas_article_links", "visa_id");

const articlePreview = (articleId) => {
  const article = articlesById.get(articleId);
  return article
    ? { id: asId(article.id), code: article.code, header: article.header }
    : null;
};

const listItems = new Map(
  rows("components_shared_list_items").map((item) => [item.id, item]),
);
const weekItemLinks = rows("components_shared_program_weeks_components");
const programWeeks = rows("components_shared_program_weeks").map((week) => ({
  id: asId(week.id),
  title: week.title,
  items: weekItemLinks
    .filter((link) => link.entity_id === week.id && link.field === "items")
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((link) => listItems.get(link.component_id))
    .filter(Boolean)
    .map((item) => ({ id: asId(item.id), icon: item.icon, text: item.text })),
}));

const main = rows("mains")[0] || null;
const mainLinks = rows("mains_components");
const componentIds = (field) =>
  mainLinks
    .filter((link) => link.entity_id === main?.id && link.field === field)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((link) => link.component_id);
const selectComponents = (table, field) => {
  const byId = new Map(rows(table).map((item) => [item.id, item]));
  return componentIds(field)
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((item) => ({ ...item, id: asId(item.id) }));
};

const mainSingle = main
  ? {
      id: asId(main.id),
      title: main.title,
      subtitle: main.subtitle,
      seo_title: main.seo_title,
      seo_subtitle: main.seo_subtitle,
      program_title: main.program_title,
      reasons_title: main.reasons_title,
      guarantee_title: main.guarantee_title,
      price_title: main.price_title,
      price_value: main.price_value,
      price_note: main.price_note,
      price_button_text: main.price_button_text,
      image: oneMedia("api::main.main", main.id, "image"),
      benefit: selectComponents("components_shared_benefits", "benefit"),
      program_weeks: componentIds("program_weeks")
        .map((id) => programWeeks.find((week) => week.id === asId(id)))
        .filter(Boolean),
      reasons: selectComponents("components_shared_feature_cards", "reasons"),
      guarantees: selectComponents("components_shared_list_items", "guarantees"),
    }
  : null;

const unis = rows("unis")
  .sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) || a.id - b.id)
  .map((uni) => ({
    id: asId(uni.id),
    header: uni.header,
    subheader: uni.subheader,
    image: oneMedia("api::uni.uni", uni.id, "image"),
    article: articlePreview(uniArticles.get(uni.id)),
  }));

const products = rows("products")
  .sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) || a.id - b.id)
  .map((product) => ({
    id: asId(product.id),
    title: product.title,
    rank: product.rank,
    subtitle_1: product.subtitle_1,
    subtitle_2: product.subtitle_2,
    subtitle_3: product.subtitle_3,
    image: oneMedia("api::product.product", product.id, "image"),
    icon_1: oneMedia("api::product.product", product.id, "icon_1"),
    icon_2: oneMedia("api::product.product", product.id, "icon_2"),
    icon_3: oneMedia("api::product.product", product.id, "icon_3"),
    article: articlePreview(productArticles.get(product.id)),
  }));

const stories = rows("stories").map((story) => ({
  id: asId(story.id),
  name: story.name,
  age: story.age,
  city: story.city,
  short_description: story.short_description,
  article: articlePreview(storyArticles.get(story.id)),
}));

const visaRow = rows("visas")[0] || null;
const visa = visaRow
  ? {
      id: asId(visaRow.id),
      header: visaRow.header,
      subheader: visaRow.subheader,
      icon: oneMedia("api::visa.visa", visaRow.id, "icon"),
      image: oneMedia("api::visa.visa", visaRow.id, "image"),
      article: articlePreview(visaArticles.get(visaRow.id)),
    }
  : null;

const realPictureRow = rows("real_pictures")[0] || null;
const realPicture = realPictureRow
  ? {
      id: asId(realPictureRow.id),
      title: realPictureRow.title,
      subtitle: realPictureRow.subtitle,
      main_image: oneMedia(
        "api::real-picture.real-picture",
        realPictureRow.id,
        "main_image",
      ),
      small_images: mediaFor(
        "api::real-picture.real-picture",
        realPictureRow.id,
        "small_images",
      ),
    }
  : null;

const socialNetworks = rows("socialnetworks")
  .sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) || a.id - b.id)
  .map((network) => ({
    name: network.name,
    url: network.url,
    icon: oneMedia("api::socialnetwork.socialnetwork", network.id, "logo"),
  }));

const articles = articleRows.map((article) => ({
  id: asId(article.id),
  code: article.code,
  header: article.header,
  subheader: article.subheader,
  seo_title: article.seo_title,
  seo_description: article.seo_description,
  text: article.text,
  type: article.type,
  stats: parseJson(article.stats, {}),
  chapters: parseJson(article.chapters, []),
  updatedAt: article.updated_at
    ? new Date(Number(article.updated_at)).toISOString()
    : null,
  preview: oneMedia("api::article.article", article.id, "preview"),
  wallpaper: oneMedia("api::article.article", article.id, "wallpaper"),
}));

const snapshot = {
  recoveredAt: "2026-08-09",
  sourceLastModified: "2026-06-19T06:27:16.159Z",
  mainSingle,
  unis,
  products,
  stories,
  visa,
  realPicture,
  countries: rows("countries")
    .sort((a, b) => (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER) || a.id - b.id)
    .map((country) => ({ id: asId(country.id), name: country.name })),
  socialNetworks,
  articles,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(
  `Exported ${articles.length} articles and ${mediaRows.length} referenced media records to ${outputPath}`,
);
