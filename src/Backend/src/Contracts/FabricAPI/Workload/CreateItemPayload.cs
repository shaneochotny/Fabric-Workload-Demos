﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;

namespace Fabric_Extension_BE_Boilerplate.Contracts.FabricAPI.Workload
{
    /// <summary>
    /// Extend the generated class by adding item-type-specific fields.
    /// In this sample every type will have a dedicated property. Alternatively, polymorphic serialization could be used.
    /// </summary>
    public partial class CreateItemPayload
    {
        [Newtonsoft.Json.JsonProperty("item1Metadata", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public Item1Metadata Item1Metadata { get; init; }
        
        [Newtonsoft.Json.JsonProperty("investmentInsightsMetadata", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public InvestmentInsightsMetadata InvestmentInsightsMetadata { get; init; }
    }
}
