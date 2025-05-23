'use client';

import type React from 'react';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, Globe, Map, Blocks, CodeXml } from 'lucide-react';

function LinkedInIcon() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 448 512'
      className='h-4 w-4'
    >
      <path d='M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z' />
    </svg>
  );
}

// TeamMember component for consistent team member display
function TeamMember({
  name,
  imageUrl = '/',
  classYear = '',
  major,
  linkedInUrl = '',
  personalUrl = '',
  size = 'regular',
  nameClickRedirect = '',
  hideProfilePicture = false,
  role = '',
  hideIcons = false,
}: {
  name: string;
  imageUrl?: string;
  classYear?: string;
  major?: string;
  linkedInUrl?: string;
  personalUrl?: string;
  size?: 'regular' | 'small';
  hideProfilePicture?: boolean;
  nameClickRedirect?: string;
  role?: string;
  hideIcons?: boolean;
}) {
  const imageSizeClass = size === 'small' ? 'w-24 h-24' : 'w-40 h-40';
  const imageSize = size === 'small' ? 96 : 160;
  const nameClass = size === 'small' ? 'font-medium' : 'text-xl font-bold';
  const yearClass =
    size === 'small' ? 'text-sm text-gray-600' : 'text-gray-600 mb-2';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className='relative flex w-48 flex-col items-center text-center'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

      <h3 className={nameClass}>
        <Link
          href={nameClickRedirect || personalUrl || linkedInUrl}
          target='_blank'
          className='transition-colors hover:text-gray-700 hover:underline hover:underline-offset-2'
        >
          {name}
        </Link>
      </h3>

      {role && (
        <div className='mb-1 text-sm font-semibold text-gray-600'>{role}</div>
      )}

      <div className={yearClass + ' mb-1'}>
        {major} {classYear}
      </div>

      {/* Show always visible icons when hideIcons is false */}
      {!hideIcons && (linkedInUrl || personalUrl) && (
        <div className='flex gap-2'>
          {linkedInUrl && (
            <Link
              href={linkedInUrl}
              className='text-gray-600 transition-colors hover:text-gray-900'
              target='_blank'
            >
              <LinkedInIcon />
            </Link>
          )}
          {personalUrl && (
            <Link
              href={personalUrl}
              className='text-gray-600 transition-colors hover:text-gray-900'
              target='_blank'
            >
              <Globe className='h-4 w-4' />
            </Link>
          )}
        </div>
      )}

      {/* Show hover-only icons when hideIcons is true */}
      {hideIcons && linkedInUrl && personalUrl && (
        <div
          className='absolute right-0 -bottom-3 left-0 flex justify-center transition-opacity duration-200'
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className='flex flex-row gap-2'>
            {linkedInUrl && (
              <Link
                href={linkedInUrl}
                className='text-gray-600 transition-colors hover:text-gray-900'
                target='_blank'
              >
                <LinkedInIcon />
              </Link>
            )}
            {personalUrl && (
              <Link
                href={personalUrl}
                className='text-gray-600 transition-colors hover:text-gray-900'
                target='_blank'
              >
                <Globe className='h-4 w-4' />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Organization component for consistent organization display
function Organization({
  name,
  description = '',
}: {
  name: string;
  description?: string;
}) {
  return (
    <div className='card flex flex-col items-center justify-center space-y-2 rounded-lg bg-gray-100 p-6 text-center shadow'>
      <h5 className='text-lg font-bold'>{name}</h5>
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
    <div className={`flex min-h-screen flex-col bg-white text-gray-900`}>
      {/* Navigation */}
      <div
        className={`navbar sticky top-0 z-50 px-8 ${
          hasScrolled ? 'shadow-sm' : ''
        } bg-white/80 backdrop-blur-md transition-all duration-200`}
      >
        <div className='navbar-start text-xl font-bold text-red-400'>
          <Link href='/dashboard'>Scarlet&nbsp;Navigator</Link>
        </div>
        <div className='navbar-end invisible md:visible'>
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
          {/* <div
            className='btn btn-ghost'
          >
            <Link href="/docs">
              Docs
            </Link>
          </div> */}
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
            Essentials for building your academic plan and graduating on time.
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
                  Free and open source.
                </h3>
                <p className='mb-6 text-lg text-gray-600'>
                  Written in TypeScript, Next.js, React, and Tailwind CSS.
                  Hosted on Cloudflare Pages. Contribute to the project on{' '}
                  <Link
                    href='https://github.com/scarletlabs/scarlet-navigator'
                    className='font-semibold text-red-400 hover:text-red-500 hover:underline hover:underline-offset-4'
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
            This is a project brought to you by{' '}
            <a className='italic'>Scarlet Labs</a>, an open-source initiative by
            the <a className='font-semibold'>Coding & Social Lounge</a>.
          </p>

          <div className='divider' />

          <p className='text-gray-600'>
            Feel free to read the original research, ideas, and proposal behind
            the project. For more in-depth and technical information, check out
            the
            <Link
              href='/docs'
              className='ml-1 font-semibold text-gray-600 hover:text-gray-900 hover:underline hover:underline-offset-2'
            >
              documentation
            </Link>
            .
            <br />
            <Link
              href='/ScarletNavWhitePaper.pdf'
              className='btn btn-outline btn-neutral mt-4 font-semibold'
              target='_blank'
            >
              Original Whitepaper
            </Link>
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className='w-full border-t border-gray-200 py-24'>
        <div className='mx-auto max-w-5xl text-center md:px-12 lg:px-16'>
          <h2 className='mb-6 text-3xl font-bold md:text-5xl'>Meet the Team</h2>
          <p className='mx-auto mb-16 max-w-[700px] text-xl text-gray-600'>
            Core Members
          </p>

          <div className='flex flex-wrap justify-center gap-8'>
            {/* Team Member 1 */}
            <TeamMember
              name='Kevin Monisit'
              classYear="'25"
              major='CS'
              imageUrl='/landing/kevin.png'
              personalUrl='https://kevinmonisit.me'
              linkedInUrl='https://www.linkedin.com/in/kevinmonisit/'
              role='Team Lead'
            />

            {/* Team Member 2 */}
            <TeamMember
              name='Sanvi Patel'
              classYear="'25"
              major='CS + Math'
              imageUrl='/landing/sanvi.jpg'
              linkedInUrl='https://www.linkedin.com/in/sanvi-patel-9763a021a/'
              role='Developer'
            />

            {/* Team Member 3 */}
            <TeamMember
              imageUrl='/landing/sibi.png'
              name='Sibi Tiruchirapalli'
              linkedInUrl='https://www.linkedin.com/in/sibi-tiruchi'
              classYear="'25"
              major='CS + Data Science'
              role='Developer'
            />
          </div>

          {/* Special Thanks Section */}
          <div className='mx-10 mt-24'>
            <h3 className='mb-6 text-2xl font-bold md:text-4xl'>
              Special Thanks
            </h3>
            <p className='mx-auto mb-12 max-w-[700px] text-lg text-gray-600'>
              Individuals who helped shape this project
            </p>

            {/* Individual Contributors */}
            <div className='mb-10'>
              <div className='flex flex-wrap justify-center gap-8'>
                <TeamMember
                  name='Jamie Liao'
                  major=''
                  size='small'
                  hideProfilePicture
                  linkedInUrl='https://www.linkedin.com/in/liaojamie'
                  nameClickRedirect='https://www.linkedin.com/in/liaojamie'
                  role='Program Coordinator'
                  hideIcons
                />

                <TeamMember
                  name='Rushd Syed'
                  major=''
                  size='small'
                  linkedInUrl='https://www.linkedin.com/in/rushds'
                  nameClickRedirect='https://www.linkedin.com/in/rushds'
                  hideProfilePicture
                  role='CSL Manager'
                  hideIcons
                />

                <TeamMember
                  name='Hanz Makmur'
                  major=''
                  size='small'
                  hideProfilePicture
                  linkedInUrl='https://www.linkedin.com/in/hanz-makmur-378021a'
                  // personalUrl='https://people.cs.rutgers.edu/~makmur/'
                  role='Technical Advisor'
                  hideIcons
                />

                <TeamMember
                  name='Billy Lynch'
                  major=''
                  size='small'
                  hideProfilePicture
                  linkedInUrl='https://www.linkedin.com/in/wflynch/'
                  // personalUrl='https://www.linkedin.com/in/wflynch/'
                  role='Technical Advisor'
                  hideIcons
                />

                <TeamMember
                  name='Anirvin Vaddiyar'
                  major=''
                  size='small'
                  hideProfilePicture
                  linkedInUrl='https://www.linkedin.com/in/anirvin-vaddiyar'
                  personalUrl='https://anirvinv.github.io/index.html'
                  role='Technical Peer Advisor'
                  nameClickRedirect='https://www.linkedin.com/in/anirvin-vaddiyar'
                  hideIcons
                />

                <TeamMember
                  name='Andrew Hong'
                  major=''
                  size='small'
                  hideProfilePicture
                  linkedInUrl='https://www.linkedin.com/in/andrew-h-452437184/'
                  personalUrl='https://andrewhong.me/'
                  role='Technical Peer Advisor'
                  nameClickRedirect='https://www.linkedin.com/in/andrew-h-452437184/'
                  hideIcons
                />

                <TeamMember
                  name='Professor Masiello'
                  major=''
                  size='small'
                  hideProfilePicture
                  personalUrl='https://wp.rutgers.edu/people/writing-program-faculty/people-details/833-masiello-michael'
                  role='Advisor'
                  nameClickRedirect='https://wp.rutgers.edu/people/writing-program-faculty/people-details/833-masiello-michael'
                  hideIcons
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='w-full border-t border-gray-200 bg-gray-100 py-12'>
        <div className='mx-auto max-w-xl px-8 text-center md:px-12 lg:px-16'>
          <div className='mb-6 flex flex-col items-center justify-center'>
            <div className='mb-4 text-xl font-bold'>
              <span>Scarlet Navigator</span>
            </div>
            {/* <p className="text-gray-600 mb-2">Affiliated with the Coding & Social Lounge and <br /> the Rutgers Computer Science Department</p> */}
            <p className='mb-4 text-gray-600'>
              Maintained by
              <Link
                target='_blank'
                href='https://github.com/Rutgers-CSL'
                className='px-1 font-bold hover:underline hover:underline-offset-4'
              >
                Scarlet Labs
              </Link>
              and the{' '}
              <Link
                href='https://spec.cs.rutgers.edu/spaces/the-csl/'
                target='_blank'
                className='font-bold hover:underline hover:underline-offset-4'
              >
                CSL
              </Link>
              .
            </p>
            <p className='mb-4 text-gray-600'>
              We are a small group of student workers dedicated to engaging the
              CS community and enabling the success of Scarlet Knights.
            </p>
            <div className='mt-2 flex items-center gap-6'>
              <Link
                href='https://github.com/Rutgers-CSL/Scarlet-Navigator'
                className='text-gray-600 transition-colors hover:text-gray-900'
                target='_blank'
              >
                <Github className='h-6 w-6' />
              </Link>
              <Link
                href='https://spec.cs.rutgers.edu/spaces/the-csl/'
                target='_blank'
              >
                <Globe className='h-6 w-6' />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
