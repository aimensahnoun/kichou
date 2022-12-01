import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <main className='w-screen h-screen flex flex-col'>
      <nav className='flex w-full items-center justify-between  p-4 border-b-[1px] border-b-kichou-gray'>
        <div className='flex items-center gap-x-4'>
          <Image src="/logo.svg" alt='Kichō Logo' width={70} height={70} />
          <div className='flex flex-col'>
            <span className='font-bold text-3xl'>Kichō</span>
            <span className='text-kichou-gray font-bold text-xl'>貴重</span>
          </div>

        </div>
        <button className='bg-kichou-red rounded-lg p-2'>Get Started</button>
      </nav>


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
