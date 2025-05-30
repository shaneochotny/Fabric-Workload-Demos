﻿// <copyright company="Microsoft">
// Copyright (c) Microsoft. All rights reserved.
// </copyright>

namespace Fabric_Extension_BE_Boilerplate.Constants
{
    public static class ErrorCodes
    {
        public const string InternalError = "InternalError";

        public static class Authentication
        {
            public const string AuthUIRequired = "AuthUIRequired";
        }

        public static class Security
        {
            public const string AccessDenied = "AccessDenied";
        }

        public static class ItemPayload
        {
            public const string InvalidItemPayload = "InvalidItemPayload";
            public const string MissingLakehouseReference = "MissingLakehouseReference";
        }
    }
}
