import Navbar from '@components/core/Navbar';
import Page from '@components/core/Page';
import AnimeCard from '@components/home/AnimeCard';
import type { NextPage } from 'next';

const Home: NextPage = () => {
  return (
    <Page>
      <Navbar />
      <div className="flex flex-col items-center md:items-start">
        <h1 className="uppercase text-2xl font-semibold mb-5">Library</h1>
        <div className="w-full grid gap-10 justify-center grid-cols-fill-267">
          <AnimeCard
            name="Jujutsu Kaisen"
            coverUrl="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg"
          />
          <AnimeCard
            name="Kaguya-sama wa Kokurasetai: Ultra Romantic "
            coverUrl="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx125367-bl5vGalMH2cC.png"
          />
          <AnimeCard
            name="Jujutsu Kaisen"
            coverUrl="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg"
          />
          <AnimeCard
            name="Jujutsu Kaisen"
            coverUrl="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg"
          />
          <AnimeCard
            name="Jujutsu Kaisen"
            coverUrl="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg"
          />
          <AnimeCard
            name="Jujutsu Kaisen"
            coverUrl="https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pEFseh.jpg"
          />
        </div>
      </div>
    </Page>
  );
};

export default Home;
