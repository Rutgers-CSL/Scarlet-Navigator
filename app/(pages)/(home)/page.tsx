'use client';

import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, Github, Globe, Map, Blocks, CodeXml } from 'lucide-react';

// TeamMember component for consistent team member display
function TeamMember({
  name,
  imageUrl = '/placeholder.svg?height=128&width=128',
  classYear,
  major,
  linkedInUrl = 'https://linkedin.com',
  size = 'regular',
  hideLinkedIn = false,
  hideProfilePicture = false,
}: {
  name: string;
  imageUrl?: string;
  classYear: string;
  major?: string;
  linkedInUrl?: string;
  size?: 'regular' | 'small';
  hideLinkedIn?: boolean;
  hideProfilePicture?: boolean;
}) {
  const imageSizeClass = size === 'small' ? 'w-24 h-24' : 'w-32 h-32';
  const imageSize = size === 'small' ? 96 : 128;
  const nameClass = size === 'small' ? 'font-medium' : 'text-xl font-bold';
  const yearClass =
    size === 'small' ? 'text-sm text-gray-600' : 'text-gray-600 mb-2';

  return (
    <div className='flex w-48 flex-col items-center text-center'>
      {!hideProfilePicture && (
        <div
          className={`${imageSizeClass} overflow-hidden rounded-full ${size === 'small' ? 'mb-4' : 'mb-6'} relative bg-gray-200`}
        >
          <Image
            src={imageUrl}
            alt={name}
            width={imageSize}
            height={imageSize}
            className='absolute inset-0 h-full w-full object-cover'
          />
        </div>
      )}
      <h3 className={nameClass + ' mb-1'}>{name}</h3>
      <p className={yearClass}>
        {major} {classYear}
      </p>
      {!hideLinkedIn && linkedInUrl && (
        <Link
          href={linkedInUrl}
          className='text-gray-600 transition-colors hover:text-gray-900'
        >
          <Linkedin className='h-4 w-4' />
        </Link>
      )}
    </div>
  );
}

// Organization component for consistent organization display
function Organization({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className='card rounded-lg bg-gray-100 p-6 text-center shadow'>
      <h5 className='mb-2 text-lg font-bold'>{name}</h5>
      <p className='text-sm text-gray-600'>{description}</p>
    </div>
  );
}

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const teamRef = useRef<HTMLElement>(null);

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (elementRef: React.RefObject<HTMLElement | null>) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className='flex min-h-screen flex-col bg-white text-gray-900'>
      {/* Navigation */}
      <div
        className={`navbar sticky top-0 z-50 px-8 ${
          hasScrolled ? 'shadow-sm' : ''
        } bg-white/80 backdrop-blur-md transition-all duration-200`}
      >
        <div className='navbar-start text-xl font-bold text-red-400'>
          <span>Scarlet Navigator</span>
        </div>
        <div className='navbar-end'>
          <div
            className='btn btn-ghost'
            onClick={() => scrollToSection(featuresRef)}
          >
            Features
          </div>
          <div
            className='btn btn-ghost'
            onClick={() => scrollToSection(aboutRef)}
          >
            About
          </div>
          <div
            className='btn btn-ghost'
            onClick={() => scrollToSection(teamRef)}
          >
            Team
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className='flex w-full items-center justify-center py-24 md:py-32'>
        <div className='container max-w-3xl px-8 text-center'>
          <h1 className='mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-5xl'>
            Plan Your Way to Success.
            <br />
            Graduate a <span className='text-red-400'>Scarlet Knight</span>.
          </h1>
          <p className='mx-auto mb-8 max-w-[700px] text-xl text-gray-600'>
            A modern solution to course planning at Rutgers University
          </p>
          <div className='flex flex-col justify-center gap-4 sm:flex-row'>
            <Link
              href='/dashboard'
              className='btn text-md bg-red-400 px-8 py-6 text-white normal-case'
            >
              Get Started
            </Link>
            <button
              className='btn text-md px-8 py-6 normal-case'
              onClick={() => scrollToSection(featuresRef)}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className='w-full border-t border-gray-200 py-24'
      >
        <div className='container mx-auto max-w-5xl px-8 text-center md:px-12 lg:px-16'>
          <h2 className='mb-6 text-3xl font-bold md:text-5xl'>
            Powerful Features
          </h2>
          <p className='mx-auto mb-16 max-w-[700px] text-xl text-gray-600'>
            Everything you need to plan your academic journey and graduate on
            time
          </p>

          <div className='grid gap-24'>
            {/* Feature 1 */}
            <div className='grid items-center gap-12 md:grid-cols-2'>
              <div className='text-center'>
                <h3 className='mb-4 text-center text-2xl font-bold md:text-3xl'>
                  Drag and drop 10,000+ courses into your plan.
                </h3>
                <p className='mb-6 text-lg text-gray-600'>
                  Instantly search for courses by name or course code across all
                  Rutgers campuses, across all terms, and across all academic
                  departments. If you can&apos;t find your course—
                  <a className='italic'>don&apos;t worry</a>—you can add it as a
                  custom course.
                  {/*
                  Automatic prerequisite validation. Core requirement tracking. Real-time credit calculation.
                  Make your custom course plan without having to keep tab on all the details. */}
                </p>
              </div>
              <div className='card flex aspect-video items-center justify-center rounded-lg bg-gray-100 p-6 shadow'>
                <Blocks className='h-24 w-24 text-red-400 opacity-80' />
              </div>
            </div>

            {/* Feature 2 */}
            <div className='grid items-center gap-12 md:grid-cols-2 md:flex-row-reverse'>
              <div className='text-center md:order-2'>
                <h3 className='mb-4 text-center text-2xl font-bold md:text-3xl'>
                  Easily find the best path towards graduation.
                </h3>
                <p className='mb-6 text-lg text-gray-600'>
                  Automatically verify the prerequisites of your schedule.
                  Instantly track your core requirements. Calculate your credits
                  and see your progress towards graduation. All in one place.
                </p>
              </div>
              <div className='card flex aspect-video items-center justify-center rounded-lg bg-gray-100 p-6 shadow md:order-1'>
                <Map className='h-24 w-24 text-red-400 opacity-80' />
              </div>
            </div>

            {/* Feature 3 */}
            <div className='grid items-center gap-12 md:grid-cols-2'>
              <div className='text-center'>
                <h3 className='mb-4 text-center text-2xl font-bold md:text-3xl'>
                  Open source project.
                </h3>
                <p className='mb-6 text-lg text-gray-600'>
                  Written in TypeScript, Next.js, React, and Tailwind CSS.
                  Hosted on Cloudflare Pages. Contribute to the project on{' '}
                  <Link
                    href='https://github.com/scarletlabs/scarlet-navigator'
                    className='text-red-400 hover:text-red-500 hover:underline hover:underline-offset-4'
                  >
                    GitHub
                  </Link>
                  .
                </p>
              </div>
              <div className='card flex aspect-video items-center justify-center rounded-lg bg-gray-100 p-6 shadow'>
                <CodeXml className='h-24 w-24 text-red-400 opacity-80' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        ref={aboutRef}
        className='w-full border-t border-gray-200 bg-gray-100 py-24'
      >
        <div className='container mx-auto max-w-3xl px-8 text-center md:px-12 lg:px-16'>
          <h2 className='mb-6 text-3xl font-bold md:text-5xl'>About</h2>
          <p className='mb-8 text-xl text-gray-600'>
            Scarlet Navigator is a free and open source project designed to make
            planning your courses less confusing and more intuitive. By looking
            at the bigger picture, you&apos;ll be more confident about your path
            towards graduation.
          </p>
          <p className='mb-8 text-gray-600'>
            This is a project brought to you by Scarlet Labs, an open-source
            initiative by the Coding & Social Lounge.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className='w-full border-t border-gray-200 py-24'>
        <div className='mx-auto max-w-5xl text-center md:px-12 lg:px-16'>
          <h2 className='mb-6 text-3xl font-bold md:text-5xl'>Meet the Team</h2>
          <p className='mx-auto mb-16 max-w-[700px] text-xl text-gray-600'>
            Scarlet Lab Members
          </p>

          <div className='flex flex-wrap justify-center gap-8'>
            {/* Team Member 1 */}
            <TeamMember
              name='Kevin Monisit'
              classYear="'25"
              major='CS'
              imageUrl='/landing/kevin.png'
            />

            {/* Team Member 2 */}
            <TeamMember name='Sanvi Patel' classYear="'25" major='CS + Math' />

            {/* Team Member 3 */}
            <TeamMember name='Sibi Tiruchirapalli' classYear="'25" major='CS' />
          </div>

          {/* Special Thanks Section */}
          <div className='mt-24'>
            <h3 className='mb-6 text-2xl font-bold md:text-4xl'>
              Special Thanks
            </h3>
            <p className='mx-auto mb-12 max-w-[700px] text-lg text-gray-600'>
              Individuals who helped us made this project possible.
            </p>

            {/* Individual Contributors */}
            <div className='mb-16'>
              {/* <h4 className="text-xl font-semibold mb-8">Our Advocates</h4> */}
              <div className='flex flex-wrap justify-center gap-8'>
                <TeamMember
                  name='Jamie Lao'
                  classYear='Program Manager'
                  major=''
                  imageUrl='/placeholder.svg?height=96&width=96'
                  size='small'
                  hideLinkedIn
                  hideProfilePicture
                />

                <TeamMember
                  name='Rushd Syed'
                  classYear='CSL Manager'
                  major=''
                  imageUrl='/placeholder.svg?height=96&width=96'
                  size='small'
                  hideLinkedIn
                  hideProfilePicture
                />

                <TeamMember
                  name='Hanz Makmur'
                  classYear='Technical Advisor & Advocate'
                  major=''
                  imageUrl='/placeholder.svg?height=96&width=96'
                  size='small'
                  hideLinkedIn
                  hideProfilePicture
                />

                <TeamMember
                  name='Billy Flynch'
                  classYear='Technical Advisor'
                  major=''
                  imageUrl='/placeholder.svg?height=96&width=96'
                  size='small'
                  hideLinkedIn
                  hideProfilePicture
                />
              </div>
            </div>

            {/* Organizations */}
            <div>
              <h4 className='mb-8 text-xl font-semibold'>
                Supporting Organizations
              </h4>
              <div className='flex flex-wrap justify-center gap-8'>
                <Organization
                  name='Coding & Social Lounge'
                  description='Group of student workers engaging the local CS community'
                />

                <Organization
                  name='Rutgers Computer Science Department'
                  description='Legendary faculty and staff'
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="w-full py-24 border-t border-gray-200 bg-gray-100" >
        <div className="container px-8 md:px-12 lg:px-16 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of Rutgers students who are planning their academic journey with Scarlet Navigator.
          </p>
          <button className="btn bg-red-400 text-white text-lg px-8 py-6 normal-case">Login with Google</button>
        </div>
      </section> */}

      {/* Footer */}
      <footer className='w-full border-t border-gray-200 bg-gray-100 py-12'>
        <div className='mx-auto max-w-xl px-8 text-center md:px-12 lg:px-16'>
          <div className='mb-6 flex flex-col items-center justify-center'>
            <div className='mb-4 text-xl font-bold'>
              <span>Scarlet Navigator</span>
            </div>
            {/* <p className="text-gray-600 mb-2">Affiliated with the Coding & Social Lounge and <br /> the Rutgers Computer Science Department</p> */}
            <p className='mb-4 text-gray-600'>Maintained by Scarlet Labs</p>
            <div className='mt-2 flex items-center gap-6'>
              <Link
                href='https://github.com'
                className='text-gray-600 transition-colors hover:text-gray-900'
              >
                <Github className='h-6 w-6' />
              </Link>
              <Link href=''>
                <Globe className='h-6 w-6' />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
