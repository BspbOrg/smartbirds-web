/**
 * Created by groupsky on 15.08.16.
 */

const forms = module.exports = {
  cbm: {
    model: 'FormCBM',
    serverModel: 'formCBM',
    label: 'FORM_LABEL_CBM',
    translatePrefix: 'CBM',
    speciesType: 'birds',
    hasCount: true,
    longLabel: 'FORM_CBM_LONG',
    shortLabel: 'FORM_CBM_SHORT',
    filters: [
      '{location:int}',
      'zone',
      '{user:int}',
      'visit',
      '{year:int}',
      'species',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  birds: {
    model: 'FormBirds',
    serverModel: 'formBirds',
    label: 'FORM_LABEL_BIRDS',
    translatePrefix: 'BIRDS',
    speciesType: 'birds',
    hasCount: true,
    longLabel: 'FORM_BIRDS_LONG',
    shortLabel: 'FORM_BIRDS_SHORT',
    hasStats: true,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  birdsMigrations: {
    model: 'FormBirdsMigrations',
    serverModel: 'formBirdsMigrations',
    label: 'FORM_LABEL_BIRDS_MIGRATIONS',
    translatePrefix: 'BIRDS_MIGRATIONS',
    speciesType: 'birds',
    hasCount: true,
    longLabel: 'FORM_BIRDS_MIGRATIONS_LONG',
    shortLabel: 'FORM_BIRDS_MIGRATIONS_SHORT',
    hasStats: false,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'migration_point',
      'source'
    ]
  },
  fishes: {
    model: 'FormFishes',
    serverModel: 'formFishes',
    label: 'FORM_LABEL_FISHES',
    translatePrefix: 'FISHES',
    speciesType: 'fishes',
    hasCount: true,
    longLabel: 'FORM_FISHES_LONG',
    shortLabel: 'FORM_FISHES_SHORT',
    hasStats: true,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  herptiles: {
    model: 'FormHerptiles',
    serverModel: 'formHerptiles',
    label: 'FORM_LABEL_HERPTILES',
    translatePrefix: 'HERPTILES',
    speciesType: 'herptiles',
    hasCount: true,
    longLabel: 'FORM_HERPTILES_LONG',
    shortLabel: 'FORM_HERPTILES_SHORT',
    hasStats: true,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  mammals: {
    model: 'FormMammals',
    serverModel: 'formMammals',
    label: 'FORM_LABEL_MAMMALS',
    translatePrefix: 'MAMMALS',
    speciesType: 'mammals',
    hasCount: true,
    longLabel: 'FORM_MAMMALS_LONG',
    shortLabel: 'FORM_MAMMALS_SHORT',
    hasStats: true,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  bats: {
    model: 'FormBats',
    serverModel: 'formBats',
    label: 'FORM_LABEL_BATS',
    translatePrefix: 'BATS',
    speciesType: 'bats',
    hasCount: true,
    longLabel: 'FORM_BATS_LONG',
    shortLabel: 'FORM_BATS_SHORT',
    hasStats: false,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  invertebrates: {
    model: 'FormInvertebrates',
    serverModel: 'formInvertebrates',
    label: 'FORM_LABEL_INVERTEBRATES',
    translatePrefix: 'INVERTEBRATES',
    speciesType: 'invertebrates',
    hasCount: true,
    longLabel: 'FORM_INVERTEBRATES_LONG',
    shortLabel: 'FORM_INVERTEBRATES_SHORT',
    hasStats: true,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  plants: {
    model: 'FormPlants',
    serverModel: 'formPlants',
    label: 'FORM_LABEL_PLANTS',
    translatePrefix: 'PLANTS',
    speciesType: 'plants',
    hasCount: true,
    longLabel: 'FORM_PLANTS_LONG',
    shortLabel: 'FORM_PLANTS_SHORT',
    hasStats: true,
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  bears: {
    model: 'FormBears',
    serverModel: 'formBears',
    label: 'FORM_LABEL_BEARS',
    translatePrefix: 'BEARS',
    speciesType: 'mammals',
    hasCount: true,
    longLabel: 'FORM_BEARS_LONG',
    shortLabel: 'FORM_BEARS_SHORT',
    hasStats: false,
    filters: [
      'auto_location',
      '{user:int}',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threatsBears',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  ciconia: {
    model: 'FormCiconia',
    serverModel: 'formCiconia',
    label: 'FORM_LABEL_CICONIA',
    translatePrefix: 'CICONIA',
    hasCount: false,
    longLabel: 'FORM_CICONIA_LONG',
    shortLabel: 'FORM_CICONIA_SHORT',
    filters: [
      'auto_location',
      '{user:int}',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'threat',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  threats: {
    model: 'FormThreats',
    serverModel: 'formThreats',
    label: 'FORM_LABEL_THREATS',
    translatePrefix: 'THREATS',
    hasCount: true,
    longLabel: 'FORM_THREATS_LONG',
    shortLabel: 'FORM_THREATS_SHORT',
    publicTemplate: '/views/monitorings/list_threats_public.html',
    filters: [
      'auto_location',
      '{user:int}',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'class',
      'primaryType',
      'species',
      'category',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  pylons: {
    model: 'FormPylons',
    serverModel: 'formPylons',
    label: 'FORM_LABEL_PYLONS',
    translatePrefix: 'PYLONS',
    speciesType: 'birds',
    hasCount: false,
    longLabel: 'FORM_PYLONS_LONG',
    shortLabel: 'FORM_PYLONS_SHORT',
    filters: [
      'auto_location',
      '{user:int}',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'organization',
      'moderatorReview',
      'source'
    ]
  },
  pylonsCasualties: {
    model: 'FormPylonsCasualties',
    serverModel: 'formPylonsCasualties',
    label: 'FORM_LABEL_PYLONS_CASUALTIES',
    translatePrefix: 'PYLONS_CASUALTIES',
    speciesType: 'birds',
    hasCount: true,
    longLabel: 'FORM_PYLONS_CASUALTIES_LONG',
    shortLabel: 'FORM_PYLONS_CASUALTIES_SHORT',
    filters: [
      'auto_location',
      '{user:int}',
      'species',
      'from_date',
      'to_date',
      'latitude',
      'longitude',
      'radius',
      'tab',
      'organization',
      'moderatorReview',
      'source'
    ]
  }
}

Object.entries(forms).forEach(function (entry) {
  entry[1].key = entry[0]
})

require('../app')
  .run(
    // this generates an injectable method with injections being the form models
    // ['FormCBM', 'FormBirds', ..., function () {}]
    Object
      .keys(forms)
      .map(function (key) { return forms[key].model })
      .concat([function () {
        const args = arguments
        Object
          .keys(forms)
          .forEach(function (key, idx) {
            forms[key].modelRef = args[idx]
          })
      }])
  )
