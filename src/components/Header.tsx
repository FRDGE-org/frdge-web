import Link from 'next/link'
import Image from 'next/image'
import { shadow } from '@/styles/utils'
import { Button } from './ui/button';
import DarkModeToggle from './DarkModeToggle';
import LogOutButton from './LogOutButton';
import { getUser } from '@/auth/server';
import { SidebarTrigger } from './ui/sidebar';

async function Header() {
    const user = await getUser()

    return (
        <header className='relative flex h-17 w-full items-center justify-between bg-popover px-3 sm:px-8'
        // style={{
        //     boxShadow: shadow
        // }}
        >
            {/* <SidebarTrigger className='absolute left-1 top-1'/> */}
            <Link className='flex items-center gap-2' href='/'>
                {/* <Image
                    src='/frdge-logo.svg'
                    height={55}
                    width={55}
                    alt='logo'
                    priority
                /> */}
                <h1 className='flex flex-col pb-1 text-2xl font-semibold leading-6 ml-6'>
                    FRDGE .
                </h1>
            </Link>
            <div className='flex gap-4'>
                {
                    user
                    ?
                    (<LogOutButton/>)
                    :
                    <>
                        <Button asChild>
                            <Link href='/sign-up' className='hidden sm:block'>Sign Up</Link>
                        </Button>
                        <Button asChild variant='outline'>
                            <Link href='/login'>Login</Link>
                        </Button>
                    </>
                }
                <DarkModeToggle/>
            </div>
        </header>
    )
}

export default Header