import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
}

const SEO = ({
    title,
    description = "Gestiona tu ministerio de alabanza de forma profesional. Organiza ensayos, repertorio, integrantes y servicios en un solo lugar."
}: SEOProps) => {
    const siteTitle = "Alabanza Planner Pro";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};

export default SEO;
