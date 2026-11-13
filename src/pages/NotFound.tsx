import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function NotFound({ title = 'Страница не найдена', text = 'Возможно, ссылка устарела или в адресе опечатка.' }: { title?: string; text?: string }) {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <p className="font-display text-[7rem] font-extrabold leading-none text-accent sm:text-[10rem]">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold">{title}</h1>
      <p className="mt-3 max-w-md text-neutral-500">{text}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-ghost"><ArrowLeft className="size-4" /> На главную</Link>
        <Link to="/catalog" className="btn-primary">В каталог</Link>
      </div>
    </div>
  )
}
