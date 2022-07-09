import Episode from '@components/core/Episode';
import Navbar from '@components/core/Navbar';
import Page from '@components/core/Page';
import VideoPlayer from '@components/core/VideoPlayer';

import { NextPage } from 'next';
import { useState } from 'react';

const animeEpisodes = [
  { id: 1, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 2, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 3, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 5, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 6, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 7, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
  { id: 8, name: '[Shingeki no Kyojin Final Season] Episode 83 - Pride' },
];

const STEP = 0.1;
const MIN = 0;
const MAX = 100;

const Watch: NextPage = () => {
  const episodes = animeEpisodes.map((episode) => (
    <Episode className="w-full" key={episode.id}>
      {episode.name}
    </Episode>
  ));

  return (
    <Page>
      <Navbar />
      <main className="flex gap-2 2xl:gap-4 flex-col 2xl:flex-row">
        <section>
          <VideoPlayer />
        </section>
        <aside className="flex flex-col gap-2">
          <h1 className="font-bold uppercase text-lg text-rose-700">
            Episodes
          </h1>
          <div className="flex flex-col gap-2">{episodes}</div>
        </aside>
      </main>
    </Page>
  );
};

export default Watch;
