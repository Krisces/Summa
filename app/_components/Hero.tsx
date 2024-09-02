import Image from 'next/image'
import React from 'react'

function Hero() {
  return (
    <section className="bg-gray-900 text-white flex items-center flex-col">
  <div className="mx-auto max-w-screen-xl px-4 py-32 lg:flex">
    <div className="mx-auto max-w-3xl text-center">
      <h1
        className="bg-gradient-to-r from-green-300 via-blue-500 to-violet-600 bg-clip-text text-3xl font-extrabold text-transparent sm:text-5xl"
      >
        Your Finances, Tailored to You

        <span className="sm:block"> Analyze, Plan, Prosper </span>
      </h1>

      <p className="mx-auto mt-4 max-w-xl sm:text-xl/relaxed">
      Get Started on Your Financial Journey
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <a
          className="block w-full rounded border border-violet-600 bg-violet-600 px-12 py-3 text-sm font-medium text-white hover:bg-transparent hover:text-white focus:outline-none focus:ring active:text-opacity-75 sm:w-auto"
          href="/sign-in"
        >
          Get Started
        </a>

        <a
          className="block w-full rounded border border-violet-600 px-12 py-3 text-sm font-medium text-white hover:bg-violet-600 focus:outline-none focus:ring active:bg-violet-600 sm:w-auto"
          href="#"
        >
          Learn More
        </a>
      </div>
    </div>
  </div>
  <Image src={'/dashboard.png'} alt='dashboard'
  width={1000}
  height={700}
  className='mb-10 rounded-xl border-2'
  />
</section>
  )
}

export default Hero