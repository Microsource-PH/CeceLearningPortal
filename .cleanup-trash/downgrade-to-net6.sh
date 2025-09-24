#!/bin/bash

echo "Downgrading CeceLearningPortal to .NET 6.0..."
echo "=============================================="

# Update the project file
sed -i 's/<TargetFramework>net9.0<\/TargetFramework>/<TargetFramework>net6.0<\/TargetFramework>/g' CeceLearningPortal.Backend/CeceLearningPortal.Api/CeceLearningPortal.Api.csproj

# Update package versions to .NET 6.0 compatible versions
cat > CeceLearningPortal.Backend/CeceLearningPortal.Api/CeceLearningPortal.Api.csproj << 'EOF'
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.Facebook" Version="6.0.32" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.Google" Version="6.0.32" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="6.0.32" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="6.0.32" />
    <PackageReference Include="Microsoft.AspNetCore.SignalR" Version="1.1.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="6.0.32">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="6.0.29" />
    <PackageReference Include="Serilog.AspNetCore" Version="6.1.0" />
    <PackageReference Include="Serilog.Sinks.File" Version="5.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.7.0" />
  </ItemGroup>

</Project>
EOF

echo "Project downgraded to .NET 6.0"
echo "Now run: dotnet restore"