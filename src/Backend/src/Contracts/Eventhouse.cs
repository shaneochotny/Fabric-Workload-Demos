// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    public class Eventhouses
    {
        public List<Eventhouse> Value { get; init; }
        public string ContinuationToken { get; init; }
        public string ContinuationUri { get; init; }
    }

    public class Eventhouse
    {
        public string Id { get; init; }
        public string DisplayName { get; init; }
        public string Description { get; init; }
        public string Type { get; init; }
        public string WorkspaceId { get; init; }
        public EventhouseProperties Properties { get; init; }
    }

    public class EventhouseProperties
    {
        public string QueryServiceUri { get; init; }
        public string IngestionServiceUri { get; init; }
        public List<string> DatabasesItemIds { get; init; }
    }

    public class KQLDatabases
    {
        public List<KQLDatabase> Value { get; init; }
        public string ContinuationToken { get; init; }
        public string ContinuationUri { get; init; }
    }

    public class KQLDatabase
    {
        public string Id { get; init; }
        public string DisplayName { get; init; }
        public string Description { get; init; }
        public string Type { get; init; }
        public string WorkspaceId { get; init; }
        public KQLDatabaseProperties Properties { get; init; }
    }

    public class KQLDatabaseProperties
    {
        public string ParentEventhouseItemId { get; init; }
        public string QueryServiceUri { get; init; }
        public string IngestionServiceUri { get; init; }
        public string DatabaseType { get; init; }
    }

    public class KQLDatabaseQuery
    {
        public string QueryServiceUri { get; init; }
        public string EventhouseId { get; init; }
        public string EventhouseName { get; init; }
        public string KQLDatabaseName { get; init; }
        public string Query { get; init; }
    }
}