import { Slider } from "./ui/Slider";
import { Toggle } from "./ui/Toggle";

interface IBasicToolsTabProps {
  brightness: number | null;
  setBrightness: (value: number | null) => void;
  contrast: number | null;
  setContrast: (value: number | null) => void;
  threshold: number | null;
  setThreshold: (value: number | null) => void;
  isNegative: boolean | null;
  setIsNegative: (value: boolean | null) => void;
  isGrayscale: boolean | null;
  setIsGrayscale: (value: boolean | null) => void;
}

export const BasicToolsTab = (props: IBasicToolsTabProps) => {
  return (
    <div className="flex flex-col gap-4 w-full pt-4">
      <Slider
        label={`Jasność: ${props.brightness ?? 100}%`}
        value={props.brightness}
        minValue={0}
        maxValue={200}
        onChange={(value) => props.setBrightness(value)}
        onReset={() => props.setBrightness(100)}
        defaultValue={100}
      />

      <Slider
        label={`Kontrast: ${props.contrast ?? 100}%`}
        value={props.contrast}
        minValue={0}
        maxValue={200}
        onChange={(value) => props.setContrast(value)}
        onReset={() => props.setContrast(100)}
        defaultValue={100}
      />

      <Slider
        label="Binaryzacja"
        value={props.threshold}
        minValue={0}
        maxValue={255}
        onChange={(value) => props.setThreshold(value)}
        isToggle
        onReset={() => props.setThreshold(null)}
        onToggle={(isToggle) => props.setThreshold(isToggle ? 128 : null)}
        defaultValue={128}
      />

      <Toggle
        label="Skala szarości"
        isChecked={props.isGrayscale ?? false}
        onChange={props.setIsGrayscale}
      />

      <Toggle
        label="Negatyw"
        isChecked={props.isNegative ?? false}
        onChange={props.setIsNegative}
      />
    </div>
  );
};
