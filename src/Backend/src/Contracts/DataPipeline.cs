// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Collections.Generic;

namespace Boilerplate.Contracts
{
    public class DataPipelines
    {
        public List<DataPipeline> Value { get; init; }
        public string ContinuationToken { get; init; }
        public string ContinuationUri { get; init; }
    }

    public class DataPipeline
    {
        public string Id { get; init; }
        public string DisplayName { get; init; }
        public string Description { get; init; }
        public string Type { get; init; }
        public string WorkspaceId { get; init; }
    }
}