import fs from 'fs';
import path from 'path';
import consola from 'consola';

const removeAuthentication = async (tsFullDir: string, tsSkDir: string) => {
  // Update user dropdown
  const userDropdownPath = path.join(tsSkDir, 'src/components/layout/shared/UserDropdown.tsx');
  await updateUserDropdown(userDropdownPath);
  
  // Update login page
  const loginFullPath = path.join(tsFullDir, 'src/views/pages/auth/LoginV2.tsx')
  const loginSkPath = path.join(tsSkDir, 'src/views/Login.tsx');
  await updateLogin(loginFullPath, loginSkPath);

  // Update home page
  const homePagePath = path.join(tsSkDir, 'src/app/page.tsx');
  await updateHomePage(homePagePath);
}

async function updateUserDropdown(userDropdownPath: string) {
  try {
    let content = fs.readFileSync(userDropdownPath, 'utf8');

    // Remove import { signOut, useSession } from 'next-auth/react'
    content = content.replace(/import { signOut, useSession } from 'next-auth\/react'/g, '');
    content = content.replace(/const { data: session } = useSession\(\)/g, '');
    content = content.replace(/import type { Locale } from '@configs\/i18n'/g, '');
    content = content.replace(/import { getLocalizedUrl } from '@\/utils\/i18n'/g, '');
    content = content.replace(/const { lang: locale } = useParams\(\)/g, '');
    content = content.replace(/router.push\(getLocalizedUrl\(url, locale as Locale\)\)/g, 'router.push(url)');
    content = content.replace(/import { useParams, useRouter } from 'next\/navigation'/g, "import { useRouter } from 'next\/navigation'");

    // Update handleUserLogout function
    content = content.replace(/const handleUserLogout = async \(\) => {.*catch.*?}[\n\s]+}/s, 
    `const handleUserLogout = async () => {
    // Redirect to login page
    router.push('/login')
  }`);

    // Update onClick handlers in MenuItem components
    const menuItemRegex = /<MenuItem className='gap-3' onClick=\{e => handleDropdownClose\(e, '.*?'\)}>/g;
    content = content.replace(menuItemRegex, "<MenuItem className='gap-3' onClick={e => handleDropdownClose(e)}>");

    // Replace alt={session?.user?.name || ''} with alt='John Doe'
    content = content.replace(/alt=\{session\?.user\?.name \|\| ''\}/g, "alt='John Doe'");

    // Replace src={session?.user?.image || ''} with '/images/avatars/1.png'
    content = content.replace(/src=\{session\?.user\?.image \|\| ''\}/g, "src='/images/avatars/1.png'");

    // Replace {session?.user?.name || ''} with 'John Doe'
    content = content.replace(/\{session\?.user\?.name \|\| ''\}/g, "John Doe");

    // Replace {session?.user?.email || ''} with 'admin@materio.com'
    content = content.replace(/\{session\?.user\?.email \|\| ''\}/g, "admin@materio.com");
    
    fs.writeFileSync(userDropdownPath, content);
    consola.info(`Updated file: ${userDropdownPath}`);
  } catch (err) {
    consola.error(`Error processing file ${userDropdownPath}: ${err}`);
  }
}

async function updateLogin(loginFullPath: string, loginSkPath: string) {
  // Copy login page content from full version to starter-kit's login page
  try {
    let content = fs.readFileSync(loginFullPath, 'utf8');

    content = content.replace(/href={getLocalizedUrl\('pages\/auth\/forgot-password-v2', locale as Locale\)}/g, '');
    content = content.replace(/href={getLocalizedUrl\('pages\/auth\/register-v2', locale as Locale\)}/g, '');

    // Remove import for 'next/link'
    content = content.replace(/import Link from 'next\/link'\n/g, '');

    // Remove i18n imports
    content = content.replace(/import type { Locale } from '@configs\/i18n'/g, '');
    content = content.replace(/import { getLocalizedUrl } from '@\/utils\/i18n'/g, '');

    // Update import { useParams } from 'next/navigation' with import { useRouter } from 'next/navigation'
    content = content.replace(/import { useParams } from 'next\/navigation'/g, "import { useRouter } from 'next\/navigation'");

    // Replace 'const { lang: locale } = useParams()' with 'const router = useRouter()'
    content = content.replace(/const { lang: locale } = useParams\(\)/g, "const router = useRouter()");

    // Add import for '@components/Link' after 'import Illustrations from '@components/Illustrations'
    content = content.replace(/(import Illustrations from '@components\/Illustrations'\n)/, `$1import Link from '@components\/Link'\n`);

    // Update the onSubmit handler in the <form> tag
    content = content.replace(/<form[^>]*onSubmit=\{[^}]*\}[^>]*>/, 
      `<form noValidate autoComplete='off' onSubmit={e => {e.preventDefault();router.push('/')}} className='flex flex-col gap-5'>`);


    fs.writeFileSync(loginSkPath, content);
    consola.info(`Updated file: ${loginSkPath}`);
  } catch (err) {
    consola.error(`Error processing file ${loginFullPath}: ${err}`);
  }
}

async function updateHomePage(homePagePath: string) {
  // Replace all the content of homepage
  const content = `// Next Imports
  import { redirect } from 'next/navigation'
  
  export default function Page() {
    redirect('/home')
  }
  `
  fs.writeFileSync(homePagePath, content);
  consola.info(`Updated file: ${homePagePath}`);
}
export default removeAuthentication;
