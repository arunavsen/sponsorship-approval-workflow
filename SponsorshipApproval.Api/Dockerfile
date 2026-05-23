FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY SponsorshipApproval.sln ./
COPY SponsorshipApproval.Api/SponsorshipApproval.Api.csproj SponsorshipApproval.Api/
RUN dotnet restore SponsorshipApproval.Api/SponsorshipApproval.Api.csproj

COPY SponsorshipApproval.Api/ SponsorshipApproval.Api/
RUN dotnet publish SponsorshipApproval.Api/SponsorshipApproval.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "SponsorshipApproval.Api.dll"]
