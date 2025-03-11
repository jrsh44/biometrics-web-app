import { Slider } from "../../ui/Slider";
import { Toggle } from "../../ui/Toggle";

interface IBasicToolsTabProps {
  brightness: number | null;
  changeBrightness: (value: number | null) => void;
  contrast: number | null;
  changeContrast: (value: number | null) => void;
  threshold: number | null;
  changeThreshold: (value: number | null) => void;
  isNegative: boolean | null;
  changeNegative: (value: boolean | null) => void;
  isGrayscale: boolean | null;
  changeGrayscale: (value: boolean | null) => void;
}

export const BasicToolsTab = (props: IBasicToolsTabProps) => {
  return (
    <div className="flex flex-col gap-4 w-full pt-4">
      <Slider
        label={`Jasność: ${props.brightness ?? 100}%`}
        value={props.brightness}
        minValue={0}
        maxValue={200}
        onChange={(value) => props.changeBrightness(value)}
        onReset={() => props.changeBrightness(100)}
        defaultValue={100}
      />

      <Slider
        label={`Kontrast: ${props.contrast ?? 100}%`}
        value={props.contrast}
        minValue={0}
        maxValue={200}
        onChange={(value) => props.changeContrast(value)}
        onReset={() => props.changeContrast(100)}
        defaultValue={100}
      />

      <Slider
        label="Binaryzacja"
        value={props.threshold}
        minValue={0}
        maxValue={255}
        onChange={(value) => props.changeThreshold(value)}
        isToggle
        isToggleActive={props.threshold !== null}
        onReset={() => props.changeThreshold(null)}
        onToggle={(isToggle) => props.changeThreshold(isToggle ? 128 : null)}
        defaultValue={128}
      />

      <Toggle
        label="Skala szarości"
        isChecked={props.isGrayscale ?? false}
        onChange={(value) => props.changeGrayscale(value)}
      />

      <Toggle
        label="Negatyw"
        isChecked={props.isNegative ?? false}
        onChange={(value) => props.changeNegative(value)}
      />
    </div>
  );
};
