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
    /// Represents a service for interacting with the Lakehouse storage.
    /// </summary>
    public interface IWorkloadClientService
    {
        /// <summary>
        /// Gets the Workload Settings Lakehouse.
        /// </summary>
        /// <param name="token">The access token required to authorize the API requests.</param>
        /// <param name="workspaceId">workspaceId of the requested Workspace.</param>
        /// <returns>Lakehouse properties</returns>
        Task<Lakehouse> GetWorkloadSettingsLakehouse(string token, Guid workspaceId);
    }
}