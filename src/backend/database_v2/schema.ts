import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { v4 as uuid } from 'uuid';

export const animes = sqliteTable('animes', {
  id: text('id').primaryKey().default(uuid()),
  anilistID: integer('anilist_id').primaryKey().notNull(),
  anilistURL: text('anilist_url').notNull(),
  folderPath: text('folder_path').notNull(),
  bannerImagePath: text('banner_image_path').notNull(),
  coverImagePath: text('cover_image_path').notNull(),
  description: text('description').notNull(),
  numberOfEpisodes: integer('number_of_episodes'),
  releaseDate: text('release_date').notNull(),
  meanScore: integer('mean_score').notNull(),
  averageScore: integer('average_score').notNull(),
  statusID: integer('status_id').notNull(),
  formatID: integer('format_id').notNull(),
  seasonID: integer('season_id').notNull(),
});

export const animeFormat = sqliteTable('anime_format', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
});

export const animeStatu = sqliteTable('anime_statu', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
});

export const animeSeason = sqliteTable('anime_season', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  year: integer('year').notNull(),
});

export const animeTitle = sqliteTable('anime_title', {
  id: text('id').primaryKey().default(uuid()),
  animeID: text('anime_id').notNull(),
  title: text('title').notNull(),
  typeID: integer('type_id').notNull(),
});

export const titleType = sqliteTable('title_type', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
});

export const genre = sqliteTable('genre', {
  id: integer('id').primaryKey().notNull(),
  anilistID: integer('anilist_id').notNull(),
  anilistURL: text('anilist_url').notNull(),
  name: text('name').notNull(),
});

export const studio = sqliteTable('studio', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
});

export const episode = sqliteTable('episode', {
  id: text('id').primaryKey().default(uuid()),
  title: text('title').notNull(),
  filePath: text('file_path').notNull(),
  originalFilePath: text('original_file_path').notNull(),
  coverImagePath: text('cover_image_path').notNull(),
  wasConverted: integer('was_converted').notNull().default(0),
  animeID: text('anime_id').notNull(),
});

export const subtitle = sqliteTable('subtitle', {
  id: text('id').primaryKey().default(uuid()),
  filePath: text('file_path').notNull(),
  language: text('language').notNull(),
  label: text('label').notNull(),
  episodeID: text('episode_id').notNull(),
});
