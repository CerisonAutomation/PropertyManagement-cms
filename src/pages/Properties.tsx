import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bath,
  Bed,
  Eye,
  Filter,
  Heart,
  MapPin,
  Maximize,
  Search,
  Star,
  X
} from "lucide-react";
import { useMemo, useState } from "react";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBedrooms, setSelectedBedrooms] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // Sample properties data
  const properties = [
    {
      id: 1,
      title: "Seaview Penthouse with Panoramic Views",
      type: "penthouse",
      location: "Sliema",
      price: 3500,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      image: "/src/assets/portfolio-1.jpg",
      featured: true,
      rating: 4.97,
      reviews: 24,
      amenities: ["WiFi", "AC", "Parking", "Sea View", "Panoramic Terrace", "Fully Furnished"],
      available: true,
      description: "Luxurious penthouse in prime Sliema location with breathtaking sea views and expansive terrace"
    },
    {
      id: 2,
      title: "Harbour Terrace Apartment",
      type: "apartment",
      location: "Valletta",
      price: 2800,
      bedrooms: 2,
      bathrooms: 1,
      area: 110,
      image: "/src/assets/portfolio-2.jpg",
      featured: true,
      rating: 4.95,
      reviews: 18,
      amenities: ["WiFi", "AC", "Historic Building", "Elevator", "Double Glazing"],
      available: true,
      description: "Charming apartment in Valletta's historic harbour area with modern amenities"
    },
    {
      id: 3,
      title: "Heritage Suite in Mdina",
      type: "apartment",
      location: "Mdina",
      price: 2200,
      bedrooms: 1,
      bathrooms: 1,
      area: 75,
      image: "/src/assets/portfolio-3.jpg",
      featured: false,
      rating: 4.98,
      reviews: 31,
      amenities: ["WiFi", "AC", "Historic Charm", "Quiet Area"],
      available: true,
      description: "Intimate suite in Mdina's ancient walled city, perfect for couples"
    },
    {
      id: 4,
      title: "Family Villa with Pool",
      type: "villa",
      location: "Mellieha",
      price: 4500,
      bedrooms: 5,
      bathrooms: 4,
      area: 300,
      image: "/api/placeholder/400/300",
      featured: true,
      rating: 5.0,
      reviews: 8,
      amenities: ["WiFi", "AC", "Pool", "Garden", "Parking"],
      available: false,
      description: "Spacious villa in Mellieha with private pool and stunning views"
    },
    {
      id: 5,
      title: "Penthouse with Panoramic Views",
      type: "penthouse",
      location: "Gzira",
      price: 3800,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      image: "/src/assets/portfolio-2.jpg",
      featured: false,
      rating: 4.8,
      reviews: 22,
      amenities: ["WiFi", "AC", "Panoramic Terrace", "Rooftop Access", "Modern Kitchen"],
      available: true,
      description: "Stunning penthouse with 360-degree views from Gzira's historic citadel"
    },
    {
      id: 6,
      title: "Cozy Beach Apartment",
      type: "apartment",
      location: "St. Paul's Bay",
      price: 2200,
      bedrooms: 2,
      bathrooms: 1,
      area: 85,
      image: "/src/assets/portfolio-3.jpg",
      featured: false,
      rating: 4.6,
      reviews: 19,
      amenities: ["WiFi", "AC", "Sea View", "Balcony", "Modern Furnishings", "Gym Access"],
      available: true,
      description: "Premium apartment in Malta's vibrant capital with luxury amenities and stunning sea views"
    },
    {
      id: 7,
      title: "Luxury Apartment in St. Julian's",
      type: "apartment",
      location: "St. Julian's",
      price: 4200,
      bedrooms: 4,
      location: "Gzira",
      price: 3800,
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
      image: "/api/placeholder/400/300",
      featured: true,
      rating: 4.9,
      reviews: 12,
      amenities: ["WiFi", "AC", "Terrace", "Premium"],
      available: true
    }
  ];

  const filteredAndSortedProperties = useMemo(() => {
    const filtered = properties.filter(property => {
      const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "all" || property.type === selectedType;
      const matchesBedrooms = selectedBedrooms === "all" || property.bedrooms.toString() === selectedBedrooms;
      const matchesPrice = priceRange === "all" ||
                           (priceRange === "0-2000" && property.price <= 2000) ||
                           (priceRange === "2000-3000" && property.price > 2000 && property.price <= 3000) ||
                           (priceRange === "3000+" && property.price > 3000);

      return matchesSearch && matchesType && matchesBedrooms && matchesPrice;
    });

    // Sort properties
    filtered.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

    return filtered;
  }, [properties, searchTerm, selectedType, selectedBedrooms, priceRange, sortBy]);

  const PropertyCard = ({ property }: { property: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group cursor-pointer"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            alt={property.title}
            className="w-full h-48 object-cover"
            whileHover={{
              scale: 1.1,
              rotate: [0, 1, -1, 0],
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Enhanced gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-gold-light/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Featured badge with animation */}
          {property.featured && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-primary to-gold-light text-primary-foreground text-xs font-bold rounded-full shadow-lg shadow-primary/30 backdrop-blur-sm z-10"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="inline-flex items-center gap-1"
              >
                <span>⭐</span>
                <span>Featured</span>
              </motion.div>
            </motion.div>
          )}

          {/* Quick actions overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary/40 to-black/80 flex items-center justify-center backdrop-blur-sm z-20"
          >
            <div className="flex gap-2">
              <motion.button
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-primary hover:bg-white transition-all"
              >
                <Eye size={16} />
              </motion.button>
              <motion.button
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-primary hover:bg-white transition-all"
              >
                <Heart size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>

        <CardContent className="p-5 relative z-10">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-primary">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <Star size={16} fill="currentColor" />
              </motion.div>
              <span className="text-sm font-bold">{property.rating}</span>
              <span className="text-xs text-muted-foreground">({property.reviews})</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{property.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bed size={14} />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={14} />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Maximize size={14} />
              <span>{property.area}m²</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {property.amenities.slice(0, 4).map((amenity, idx) => (
              <motion.div
                key={amenity}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="px-2 py-1 bg-secondary/80 text-xs text-muted-foreground rounded-full"
              >
                {amenity}
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{property.price}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 150 }}
            >
              <Button
                className={`w-full ${
                  property.available
                    ? 'bg-primary text-primary-foreground hover:bg-gold-light'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                disabled={!property.available}
              >
                {property.available ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      View Details
                    </motion.div>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <X size={16} />
                    Currently Occupied
                  </span>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={() => {}} />

      <main className="pt-24 pb-16">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Premium Properties in Malta
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our handpicked selection of luxury properties across Malta and Gozo.
              Each home is carefully curated to ensure the highest standards of comfort and style.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartments</SelectItem>
                  <SelectItem value="villa">Villas</SelectItem>
                  <SelectItem value="townhouse">Townhouses</SelectItem>
                  <SelectItem value="studio">Studios</SelectItem>
                  <SelectItem value="penthouse">Penthouses</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
                <SelectTrigger>
                  <SelectValue placeholder="Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="1">1 Bed</SelectItem>
                  <SelectItem value="2">2 Beds</SelectItem>
                  <SelectItem value="3">3 Beds</SelectItem>
                  <SelectItem value="4">4+ Beds</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="0-2000">€0 - €2,000</SelectItem>
                  <SelectItem value="2000-3000">€2,000 - €3,000</SelectItem>
                  <SelectItem value="3000+">€3,000+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredAndSortedProperties.length}</span> properties
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Map View</Button>
              <Button variant="outline" size="sm">Grid View</Button>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* No Results */}
          {filteredAndSortedProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedBedrooms("all");
                setPriceRange("all");
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Load More */}
          {filteredAndSortedProperties.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Properties
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Properties;
