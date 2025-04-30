import { auth } from '@/lib/auth/auth';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export const GET = auth(async (req) => {
  const session = req.auth;

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  console.log(session);
  console.log(req);
  return NextResponse.json({ token });
});

// export async function GET(req: NextRequest) {
//   const session = await auth();

//   const token = await getToken({ req, secret: process.env.AUTH_SECRET });

//   if (!token || !token.accessToken) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   // const body = await req.json();
//   // const content = JSON.stringify(body);
//   // const file = new Blob([content], { type: "application/json" });

//   // const metadata = {
//   //   name: `backup_${new Date().toISOString().replace(/:/g, "-")}.json`,
//   //   mimeType: "application/json",
//   // };

//   // const form = new FormData();
//   // form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
//   // form.append("file", file);

//   // const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
//   //   method: "POST",
//   //   headers: {
//   //     Authorization: `Bearer ${token.accessToken}`,
//   //   },
//   //   body: form,
//   // });

//   // const data = await res.json();
//   return NextResponse.json({ session });
// }
