# DND-Core Folder

## What is this?

This folder contains components that may look different from the rest of the components in this codebase. The reason for this is because the original drag and drop components come from a template showcasing DnD Kit, a wrapper for React DnD library that makes the drag and dropping of components more elegant. The codebase of that template had a lot of excess code that was not needed for this project, but I had to painstakingly refactor the code, organize the utility functions, and integrate it into this Next.js application.

Because of these reasons, the code style of these components may look different---perhaps unusual or archaic. Please don't mind that!

If you'd like to see the original template if you're thinking of some crazy feature, feel free to find the repo called something like Scarlet-Navigator-v2 on my GitHub profile, `kevinmonisit`. If you go back to the commit history, you'll most likely find it.

If you ever want to replace the core drag and drop functionality because the DnD library is now defunct, you can do so without having to rewrite this entire project. Just know where the logic is placed, see how dnd-core is neatly tucked away in this nook of the codebase, and think about how you can replace it. As I was first creating this project, I had that in mind. I did not want the DnD library to be so tightly coupled into the logic. I wanted it to be easy so that, in the case that there is a need for the replacement of the DnD library, you should be able to do that in a few weeks of good engineering.

That is---by the time you're reading this, our AI-agent overlords haven't taken over.
