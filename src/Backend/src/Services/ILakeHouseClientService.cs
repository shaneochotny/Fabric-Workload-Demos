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
    /// Represents a service for interacting with Fabric Lakehouse.
    /// </summary>
    public interface ILakehouseClientService
    {
        Task<bool> CheckIfFileExists(string token, string filePath);

        Task WriteToLakehouseFile(string token, string path, string content);

        Task<string> GetLakehouseFile(string token, string source);

        Task DeleteLakehouseFile(string token, string filePath);

        Task<FabricItem> GetFabricLakehouse(string token, Guid workspaceId, Guid lakehouseId);

        Task<IEnumerable<LakehouseTable>> GetOneLakeTables(string token, Guid workspaceId, Guid lakehouseId);

        Task<Lakehouses> GetLakehouseList(string token, Guid workspaceId);

        Task<ItemCreateResponse> CreateLakehouse(string token, Guid workspaceId, string lakehouseName, string lakehouseDescription);
    }
}