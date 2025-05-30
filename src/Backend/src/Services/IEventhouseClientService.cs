// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System;
using System.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Represents a service for interacting with a Fabric Eventhouse.
    /// </summary>
    public interface IEventhouseClientService
    {
        Task<List<Eventhouse>> ListEventhouses(string token, Guid workspaceId);

        Task<Eventhouse> GetEventhouse(string token, Guid workspaceId, string eventhouseIdOrName);

        Task<Eventhouse> CreateEventhouse(string token, Guid workspaceId, string eventhouseName, string eventhouseDescription);

        Task<List<KQLDatabase>> ListKQLDatabases(string token, Guid workspaceId);

        Task<KQLDatabase> GetKQLDatabase(string token, Guid workspaceId, string kqlDatabaseIdOrName);
    
        Task<KQLDatabase> CreateKQLDatabase(string token, Guid workspaceId, Guid eventhouseId, string kqlDatabaseName, string kqlDatabaseDescription);

        Task<DataTable> ExecuteQuery(string token, string query, string connectionString, string databaseName);

        Task<DataTable> ExecuteControlQuery(string token, string query, string connectionString, string databaseName);
    }
}