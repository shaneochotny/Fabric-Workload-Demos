// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Boilerplate.Contracts
{
    public abstract class InvestmentInsightsMetadataBase<TLakehouse>
    {
        public TLakehouse Lakehouse { get; set; }
    }

    /// <summary>
    /// Represents the core metadata for item1 stored within the system's storage.
    /// </summary>
    public class InvestmentInsightsMetadata: InvestmentInsightsMetadataBase<ItemReference>
    {
        public static readonly InvestmentInsightsMetadata Default = new InvestmentInsightsMetadata { Lakehouse = new ItemReference() };

        public InvestmentInsightsMetadata Clone()
        {
            return new InvestmentInsightsMetadata
            {
                Lakehouse = Lakehouse,
            };
        }

        public InvestmentInsightsClientMetadata ToClientMetadata(FabricItem lakehouse)
        {
            return new InvestmentInsightsClientMetadata()
            {
                Lakehouse = lakehouse
            };
        }
    }

    /// <summary>
    /// Represents extended metadata for item1, including additional information
    /// about the associated lakehouse, tailored for client-side usage.
    /// </summary>
    public class InvestmentInsightsClientMetadata : InvestmentInsightsMetadataBase<FabricItem> { }
}
