export interface ILakehouse {
  id?: string | null | undefined;
  displayName?: string;
  description?: string;
  type?: string;
  workspaceId?: string;
  properties?: IProperties;

  error?: string;
};

interface IProperties {
  oneLakeTablesPath?: string;
  oneLakeFilesPath?: string;
  sqlEndpointProperties?: ISqlEndpointProperties;
};

interface ISqlEndpointProperties {
  connectionString?: string;
  id?: string;
  provisioningStatus?: string;
};