// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    public class Lakehouses
    {
        public List<Lakehouse> Value { get; init; }
    }

    public class Lakehouse
    {
        public string Id { get; init; }
        public string DisplayName { get; init; }
        public string Description { get; init; }
        public string Type { get; init; }
        public string WorkspaceId { get; init; }
        public Properties Properties { get; init; }
    }

    public class Properties
    {
        public string OneLakeTablesPath { get; init; }
        public string OneLakeFilesPath { get; init; }
        public SqlEndpointProperties SqlEndpointProperties { get; init; }
    }

    public class SqlEndpointProperties
    {
        public string ConnectionString { get; init; }
        public string Id { get; init; }
        public string ProvisioningStatus { get; init; }
    }
}