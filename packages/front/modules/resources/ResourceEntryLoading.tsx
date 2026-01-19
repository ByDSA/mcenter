import { FavButton } from "#modules/ui-kit/FavButton";
import { SettingsButton } from "#modules/ui-kit/SettingsButton/SettingsButton";
import { HistoryTimeView, WeightView } from "./metadata";
import { ResourceEntry } from "./ResourceEntry";

type Props = Pick<Parameters<typeof ResourceEntry>[0], "drag">;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ResourceEntryLoading = (props?: Props) => {
  return <ResourceEntry
    mainTitle=""
    subtitle=""
    drag={props?.drag}
    play={{
      onClick: ()=> { /* empty */ },
      status: "stopped",
    }}
    settings={<SettingsButton
      theme="dark"
    />}
    favButton={
      <FavButton
        value={false}
        disabled={true}
      />
    }
    right={
      <>
        <HistoryTimeView timestamp={0} />
        <WeightView weight={0} />
      </>
    }
  />;
};
