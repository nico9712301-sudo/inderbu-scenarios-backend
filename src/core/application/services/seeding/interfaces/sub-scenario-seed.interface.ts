interface ISubscenarioImage {
  isFeature: boolean;
  imageName: string;
  imageExtension: string;
}

export interface ISubScenarioSeed {
  name: string;
  scenarioName: string;
  hasCost: boolean;
  activityAreaName?: string;
  fieldSurfaceTypeName?: string;
  numberOfSpectators?: number;
  numberOfPlayers?: number;
  recommendations?: string;
  images?: ISubscenarioImage[]
}
