// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace Fabric_Extension_BE_Boilerplate.Constants
{
    public static class InvestmentInsightsConstants
    {
        public const string EventhouseName = "Investments";
        public const string EventhouseDescription = "Investment Insights Market Data";

        public static readonly IList<string> KQLDatabaseDDL = [
            "InvestmentInsights/KQL/raw_daily_ohlc.kql",
            "InvestmentInsights/KQL/raw_market_stream.kql",
            "InvestmentInsights/KQL/daily_ohlc.kql",
            "InvestmentInsights/KQL/aggregates.kql",
            "InvestmentInsights/KQL/latest_prices.kql",
            "InvestmentInsights/KQL/trades.kql",
            "InvestmentInsights/KQL/stocks.kql",
            "InvestmentInsights/KQL/vw_Activity.kql",
            "InvestmentInsights/KQL/vw_ClientDetails.kql",
            "InvestmentInsights/KQL/vw_PerformanceByDay.kql",
            "InvestmentInsights/KQL/vw_PortfolioValue.kql",
            "InvestmentInsights/KQL/vw_StockOHLC.kql",
        ];

        public class SampleDataItem
        {
            public string Filename { get; init; }
            public string Table { get; init; }
        }
        public static readonly List<SampleDataItem> SampleData = [
            new() { Filename = "InvestmentInsights/SampleData/holdings.csv", Table = "holdings" },
            new() { Filename = "InvestmentInsights/SampleData/portfolios.csv", Table = "portfolios" },
            new() { Filename = "InvestmentInsights/SampleData/stocks.csv", Table = "stocks" },
        ];

        public class DataPipelineItem
        {
            public string Filename { get; init; }
            public string Name { get; init; }
        }
        public static readonly List<DataPipelineItem> DataPipelines = [
            new() { Filename = "InvestmentInsights/Pipelines/historical_data_ingestion.json", Name = "Historical Stock Ingestion" }
        ];

        public class ConnectionItem
        {
            public string Filename { get; init; }
            public string Name { get; init; }
        }
        public static readonly List<ConnectionItem> Connections = [
            new() { Filename = "InvestmentInsights/Connections/polygonio.json", Name = "Polygon.io" }
        ];
    }
}
