import BrandLogo from "@/components/layout/BrandLogo";

export default function AboutPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16 ">

            <section className="mx-auto flex flex-col pt-10 pb-10 items-center text-center">
                <div className="mb-4">
                    <BrandLogo />
                    <p className="px-10 mt-4 text-base text-white/70 md:text-xl">
                        Keep track of the games you own, play, and complete.
                    </p>
                </div>
            </section>

            {/* <div className="flex h-[96px] w-[96px] aspect-square items-center justify-center  bg-green-500 ">
                <svg
                    className=
                    "text-yellow-500 h-16"


                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5ZM5,12v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1h-2v-1h-1Zm16-3h-1v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3Z" />
                </svg>
            </div> */}
        </main >
    );
}
