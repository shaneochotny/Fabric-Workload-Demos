// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Boilerplate.Services
{

    /// <summary>
    /// Represents a service for interacting with Fabric Data Pipelines.
    /// </summary>
    public interface IDataPipelineClientService
    {
        Task<List<DataPipeline>> ListDataPipelines(string token, Guid workspaceId);

        Task<DataPipeline> GetDataPipeline(string token, Guid workspaceId, string dataPipelineName);

        Task<ItemCreateResponse> CreateDataPipeline(string token, Guid workspaceId, string dataPipelineName, string dataPipelinePayload);
    }
}