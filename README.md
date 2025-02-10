<h1 align="center">Scarlet Navigator</h1>

<div align="center">

<a href="">[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)</a>
<a href="">[![GitHub issues](https://img.shields.io/github/issues/Rutgers-CSL/Scarlet-Navigator)](https://github.com/Rutgers-CSL/Scarlet-Navigator/issues)</a>

</div>

![Jul-24-2022 23-25-51](https://user-images.githubusercontent.com/7038712/183774963-b091457b-9010-4d57-8a66-e46ace5b7c76.gif)

## About

Scarlet Navigator is a free and open source project designed to make planning your courses less confusing and more intuitive. By looking at the bigger picture, you'll be more confident about your path towards graduation. Once a side-project, Scarlet Navigator is now managed, maintained, and developed by [Rutgers CSL](https://spec.cs.rutgers.edu/spaces/the-csl/).

Check out the reddit post! @ [go.rutgers.edu/scarletnav](https://go.rutgers.edu/scarletnav).

Awarded [Best Fullstack Project](https://github.com/kevinmonisit/Scarlet-Navigator/assets/7038712/f52cd55d-d7ec-4096-ae14-19067639d780) by the [Rutgers Computer Science Department](https://www.cs.rutgers.edu/)!

## Features

- **Drag and Drop**

  - Intuitively move your courses and semesters around like it's no big deal.

- **Create or Drag-In Courses**

  - From a list of over 4,500+ Rutgers University courses, drag them into your schedule. Don’t see a course? No problem! You have the option to create courses yourself.

- **Customizable Degree/Program Tracker**

  - So many cores and requirements to track. Pre-med. Pre-pt. Pre-dental. Computer Science. How about you create them yourself? Or… you can choose from a small list of already-made tracks.

- **Super Flexibility**

  - Summer/Winter/AP/College credits? Hypothetical semesters? Enable/disable/rename your semesters to match your unique college experience.

- **GPA Calculator & Credit Calculator**

  - See if you’d be on track to completing your graduation with the GPA that you want. Add in your current grades or grades that you predict you’ll receive in the future

- **Add in Helpful Notes**

  - Want to create a checklist or write down notes on particular courses or semesters? No problem. [Markdown](https://www.markdownguide.org/cheat-sheet/) is supported.

- **Exporter and Importer**

  - Export your schedule, program, courses (and more), for your friends or your community (make an `Issue` to share with the rest of us!).

- **Customizable Experience**

  - In the settings tab, feel free to choose and customize the information and colors you wish to see.

- **Save Your Data to the Cloud Easily**
  - You own your data. Login with Google and feel free to automatically sync your custom schedules, settings, courses, and programs to your Google Drive.

## Sharing Track Requirements

Thank you for sharing your work with the rest of the community. If you wish to share your custom track requirements that you've made, simply create a pull request.

1. Click on `Issues` and then at the top-right corner click `New Issue`
2. Paste in the exported requirement tracking code
3. We'll handle the rest.

## Attention

Currently in VERY active development.

## Getting Started

To start a development environment, install the following:

- [Docker](https://docs.docker.com/desktop/setup/install/mac-install/)
- [pnpm](https://pnpm.io/installation)

Then run the following commands:

```bash
pnpm run i
pnpm run dev
```

This will run two services:

- Next.js (port 3000)
- TypeSense (port 8108, dockerized)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Populating TypeSense with Course Data

For search to work, TypeSense needs to have course data. There are two things you can do:

1. Use example data (simple random data)

Run the following command:

```
pnpm run loadCourseData
```

2. Load a real set of data (from Rutgers API)

```
pnpm run loadRealCourseData
```

## Tech Stack and Features

### Tech

- [Next.js](Next.js)
- [React]()
- [DnD Kit]() - Drag and Drop
- [Auth.js]()
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Vercel]()
- [Docker]()
- [TypeSense]()

### UI

- [Tailwind CSS]()
- [DaisyUI]()

### Code Quality

- [TypeScript](Typescript)
- [Prettier](Prettier)
- [ESLint](ESLint)
- [Husky]()
