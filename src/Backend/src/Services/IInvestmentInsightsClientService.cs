// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System.Threading.Tasks;

namespace Boilerplate.Services
{

    /// <summary>
    /// Represents a service for the Investment Insights workload.
    /// </summary>
    public interface IInvestmentInsightsClientService
    {
        Task<bool> ValidatePolygonIOAPIKey(string apiKey);
    }
}