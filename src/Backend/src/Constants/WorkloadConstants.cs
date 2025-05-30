// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using System;
using System.Collections.Generic;

namespace Fabric_Extension_BE_Boilerplate.Constants
{
    public static class WorkloadConstants
    {
        public const string WorkloadName = "Org.WorkloadSample";

        public static class ItemTypes
        {
            public const string Item1 = $"{WorkloadName}.SampleWorkloadItem";
            public const string InvestmentInsights = $"{WorkloadName}.InvestmentInsights";
        }
    }
}
