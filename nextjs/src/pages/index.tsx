// NextJS import
import Image from 'next/image'

// Dependencies import
import { useAtom } from 'jotai';

// Utils import
import { navbarHightAtom } from '../utils/global-state';

export default function Home() {

  // Global state
  const [navbarHeight] = useAtom(navbarHightAtom);

  return (
    <main className={`w-screen flex flex-col`} style={{
      height: `calc(100vh - ${navbarHeight}px)`
    }}>
      <section className='flex flex-col md:flex-row w-full h-full gap-y-12 gap-x-[5rem] justify-center items-center'>
        <div className='flex flex-col'>

          <span className='font-bold text-5xl'>Kichō</span>
          <pre className='text-kichou-gray duration-300 hover:text-white'>
            A Marketplace of
            Wonders
          </pre>
        </div>

        <div className='flex rounded-lg relative'>
          <Image src="/hero.svg" className='hidden md:block bg-inherit rounded-lg bounce z-0 duration-300 hover:scale-105' alt='Marketplace' width={400} height={400} />

          <Image src="/hero.svg" className='md:hidden bg-inherit rounded-lg bounce z-0 duration-300 hover:scale-105' alt='Marketplace' width={300} height={300} />
          {
            [...Array(15)].map((_, i) => {
              return <div key={i} className="firefly z-10" />
            })
          }</div>


      </section>

    </main>
  )
}
