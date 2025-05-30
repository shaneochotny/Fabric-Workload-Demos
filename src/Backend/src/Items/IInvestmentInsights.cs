// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

using Boilerplate.Contracts;
using System.Threading.Tasks;

namespace Boilerplate.Items
{
    public interface IInvestmentInsights : IItem
    {
        ItemReference Lakehouse { get; }
    }
}
