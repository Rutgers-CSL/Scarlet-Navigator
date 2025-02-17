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

  - Intuitively move your courses around like it's no big deal. From a list of over thousands of Rutgers University courses, drag them into your schedule. Don’t see a course? No problem! You have the option to create courses yourself.

- **Customizable Degree/Program Tracker**

  - So many cores and requirements to track. Pre-med. Pre-pt. Pre-dental. Computer Science. How about you create them yourself? Or… you can choose from a small list of already-made tracks.

- **GPA Calculator & Credit Calculator**

  - See if you’d be on track to completing your graduation with the GPA that you want. Add in your current grades or grades that you predict you’ll receive in the future

- **Add in Helpful Notes**

  - Want to create a checklist or write down notes on particular courses or semesters? No problem. [Markdown](https://www.markdownguide.org/cheat-sheet/) is supported.

## Attention

Currently in VERY active development.

## Getting Started

To start a development environment, install the following:

- [Docker](https://docs.docker.com/desktop/setup/install/mac-install/) - Software container manager
- [pnpm](https://pnpm.io/installation) - A Node.js package manager

Then run the following commands:

```bash
git clone https://github.com/Rutgers-CSL/Scarlet-Navigator.git
cd Scarlet-Navigator
pnpm run i
pnpm run dev
```

`pnpm run dev` will run two services:

- Next.js (port 3000)
- TypeSense (port 8108, Docker container)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To populate TypeSense with course data,

```
pnpm run generateAndUploadFakeCourseData
```

This will spin up a TypeSense container, generate a set of random courses, upload it to the TypeSense container instance, and then take down the container. For more details, check out `scripts/generateAndUploadFakeCourses.sh`.

### General Overview

<img width="962" alt="image" src="https://github.com/user-attachments/assets/03c8cf0d-a562-48a8-b7e0-0c241907bf1a" />

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
- [Firebase Auth]()

### UI

- [Tailwind CSS]()
- [DaisyUI]()

### Code Quality

- [TypeScript](Typescript)
- [Prettier](Prettier)
- [ESLint](ESLint)
- [Husky]()
