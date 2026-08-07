type VideoProps = {
  url: string;
  title: String;
};
export function Video({ url, title }: VideoProps) {
  return (
    <div className="p-4 m-4 rounded-xl bg-gray-100 flex justify-between flex-col w-full overflow-hidden">
      <video src={url} className="rounded-xl" autoPlay muted loop playsInline/>
      <div className="text-2xl">{title}</div>
    </div>
  );
}
