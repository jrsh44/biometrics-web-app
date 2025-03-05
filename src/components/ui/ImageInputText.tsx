interface IImageInputTextProps {
  imageInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ImageInputText = (props: IImageInputTextProps) => (
  <p className="text-center">
    Przeciągnij obraz tutaj lub{" "}
    <a
      className="underline underline-offset-1 cursor-pointer hover:underline-offset-4 hover:text-gray-400"
      onClick={() => props.imageInputRef.current?.click()}
    >
      wybierz go z dysku
    </a>
  </p>
);
