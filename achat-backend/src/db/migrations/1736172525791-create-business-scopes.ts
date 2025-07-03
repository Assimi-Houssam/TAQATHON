import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBusinessScopes1736172525791 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const businessScopes = [
      { name: 'MATIÈRES AUXILIAIRES', description: null },
      { name: 'Carburants', description: null },
      { name: 'Autres sources d’énergie', description: null },
      { name: 'Architectes et paysagistes', description: null },
      { name: "Bureau d'études techniques", description: null },
      { name: 'Bureaux de Contrôle Technique', description: null },
      { name: 'Services géotechniques', description: null },
      { name: 'Prestations de Topographie', description: null },
      { name: 'Restauration', description: null },
      {
        name: 'Fournitures et équipement  de nettoyage',
        description: null,
      },
      {
        name: 'Prestations de nettoyage batiments',
        description: null,
      },
      { name: 'Appareils et articles ménagers', description: null },
      {
        name: 'Jardinage et Aménagement des espaces verts',
        description: null,
      },
      {
        name: 'Maintenance pluridisciplinaires',
        description: null,
      },
      {
        name: 'Matériel et Fournitures de bureau',
        description: null,
      },
      {
        name: 'Prestations de Gardiennage et de Sécurité',
        description: null,
      },
      {
        name: 'Location et leasing de véhicules (LLD)',
        description: null,
      },
      {
        name: 'Véhicules utilitaires et de servitude (Equipements, Fournitures et Prestations)',
        description: null,
      },
      {
        name: 'Equipements, produits et services médicaux',
        description: null,
      },
      { name: 'Autres services RH', description: null },
      { name: 'Transport du personnel', description: null },
      {
        name: 'Equipements et Articles de Sport',
        description: null,
      },
      {
        name: 'Prestations de service externalisées et Intérim',
        description: null,
      },
      { name: 'Matériel informatique', description: null },
      { name: 'Réseau et Télécommunication', description: null },
      { name: 'Logiciels et Progiciels', description: null },
      { name: 'Consulting', description: null },
      {
        name: 'Services d’ingénierie (Hors Batiment)',
        description: null,
      },
      {
        name: 'Prestations de contrôle (Hors Bâtiment et GC )',
        description: null,
      },
      { name: 'Assurances', description: null },
      { name: 'Hotel and Lodging', description: null },
      { name: 'Meeting and event venues', description: null },
      { name: 'Autres services logistiques', description: null },
      { name: 'Transport routier', description: null },
      {
        name: 'Construction Génie Civil et Batiment TCE',
        description: null,
      },
      { name: 'Bâtiments – lots techniques', description: null },
      {
        name: 'Terrassement, Voiries et Réseaux Divers (VRD)',
        description: null,
      },
      { name: 'Génie Civil Industriel', description: null },
      {
        name: 'Constructions et Prestations Portuaires',
        description: null,
      },
      { name: 'Constructions préfabriquées', description: null },
      {
        name: 'Prestations de couvertures, bardage et Skydome',
        description: null,
      },
      {
        name: 'Equipements électriques, installation et rechanges',
        description: null,
      },
      {
        name: 'Tuyauterie industrielle (Fournitures et Prestations)',
        description: null,
      },
      {
        name: 'Constructions métalliques, charpente et chaudronnerie',
        description: null,
      },
      {
        name: 'Chauffage, ventilation et climatisation',
        description: null,
      },
      {
        name: 'Tuyauterie plastique (Fournitures et Prestations)',
        description: null,
      },
      {
        name: 'Fumisterie et réfractaires (Fournitures et services)',
        description: null,
      },
      { name: 'Transversal agreements', description: null },
      {
        name: 'Alternateurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Batteries, onduleurs et accumulateurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Condensateurs électriques (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Moteurs électriques (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Transformateurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Control instrumentation (equipments and spares)',
        description: null,
      },
      {
        name: 'Vannes de régulation (équipements, services et rechanges)',
        description: null,
      },
      { name: "Bancs d'essai", description: null },
      {
        name: 'Manutention des matériaux (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Criblage (Equipements, Fournitures et Prestations)',
        description: null,
      },
      {
        name: 'Chaudières (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Brûleurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Pompes chimiques (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Compresseurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Moteurs thermiques (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Equipements de filtration (equipement, services et rechanges)',
        description: null,
      },
      {
        name: 'Pompes à carburant (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Lavage des gaz (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Echangeurs de chaleur (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Hydrocyclones (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Robinetterie industrielle (Equipements, Fournitures et Prestations)',
        description: null,
      },
      {
        name: 'Systèmes de lubrification et graissage (Equipement et services)',
        description: null,
      },
      {
        name: 'concasseurs et broyeurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Agitateurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Transmissions (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Turbines et alternateurs (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Pompes à eau (équipements, services et rechanges)',
        description: null,
      },
      { name: 'DCI', description: null },
      {
        name: 'Equipements et engins miniers (équipements, services et rechanges)',
        description: null,
      },
      {
        name: 'Equipements de levage (equipements, services et rechanges)',
        description: null,
      },
      {
        name: 'EXPLOSIFS ET ACCESSOIRES (FOURNITURES ET PRESTATIONS)',
        description: null,
      },
      {
        name: 'Electrical maintenance (electrical contracts and instrumentation)',
        description: null,
      },
      {
        name: 'Location d’engins et équipements',
        description: null,
      },
      { name: 'Nettoyage industriel', description: null },
      {
        name: 'Isolation, revêtement et peinture industriels',
        description: null,
      },
      {
        name: 'Analyses de laboratoire (externes)',
        description: null,
      },
      { name: 'Maintenance mécanique', description: null },
      { name: 'Autres services de maintenance', description: null },
      {
        name: 'Echafaudages (Fournitures et Prestations)',
        description: null,
      },
      { name: 'BOULONNERIE', description: null },
      { name: 'Catalysts and sieving services', description: null },
      {
        name: 'Quincaillerie, matériels et matériaux de construction',
        description: null,
      },
      {
        name: 'Convoyeur à Bandes (Equipements, bandes, accessoires et services)',
        description: null,
      },
      { name: 'Câbles électriques', description: null },
      {
        name: 'Fournitures et outillages électriques',
        description: null,
      },
      { name: 'Fournitures d’étanchéité', description: null },
      {
        name: 'Outillages et machine-outils (équipements, services et rechanges)',
        description: null,
      },
      { name: 'Equipements hydrauliques', description: null },
      { name: 'Gaz industriels', description: null },
      {
        name: 'Matériel et Fournitures de laboratoire',
        description: null,
      },
      { name: 'Lubrifiants', description: null },
      {
        name: 'Métaux et Pièces métalliques suivant plan',
        description: null,
      },
      { name: 'Câbles métalliques pour engins', description: null },
      {
        name: 'Fournitures d’emballage (Sacs BIG-BAG  et autres)',
        description: null,
      },
      { name: 'EPI et vêtements de travail', description: null },
      {
        name: 'Signalisation (Fournitures et Prestations)',
        description: null,
      },
      {
        name: 'Vente de Ferraille et Gestion des déchets',
        description: null,
      },
      {
        name: 'Traitement et Filtration des eaux (Equipements, Fournitures et Services)',
        description: null,
      },
    ];

    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('business_scopes')
      .values(businessScopes)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('business_scopes')
      .execute();
  }
}
