type HeaderProps = {
  name: string;         
}

export const Header =({name}:HeaderProps)=>{
    return(
        <h1 className="text-3xl font font-semibold text-gray-700">
            {name}
        </h1>
    )
}