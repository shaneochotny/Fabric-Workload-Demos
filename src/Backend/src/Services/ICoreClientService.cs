// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Represents a service for interacting with the Fabric Core APIs.
    /// </summary>
    public interface ICoreClientService
    {
        Task<List<Connection>> ListConnections(string token);

        Task<Connection> GetConnection(string token, string connectionName);

        Task<Connection> CreateConnection(string token, string connectionPayload);
    }
}