﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net;
using System.Threading.Tasks;

namespace Boilerplate.Services
{
    /// <summary>
    /// Service for interacting with the Investment Insights workload.
    /// </summary>
    public class InvestmentInsightsClientService : IInvestmentInsightsClientService
    {
        private readonly ILogger<InvestmentInsightsClientService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientService _httpClientService;

        public InvestmentInsightsClientService(
            IConfigurationService configuration,
            IHttpClientService httpClientService,
            ILogger<InvestmentInsightsClientService> logger)
        {
            _logger = logger;
            _configuration = configuration.GetConfiguration();
            _httpClientService = httpClientService;
        }

        /// <summary>
        /// Validates a Polygon.io API key.
        /// </summary>
        /// <param name="apiKey">The Polygon.io API key.</param>
        /// <returns>bool</returns>
        public async Task<bool> ValidatePolygonIOAPIKey(string apiKey)
        {
            string url = "https://api.polygon.io/v2/aggs/ticker/MSFT/prev";
            try
            {
                var response = await _httpClientService.GetAsync(url, apiKey);
                if (response.StatusCode != HttpStatusCode.OK)
                {
                    return false;
                }
                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}