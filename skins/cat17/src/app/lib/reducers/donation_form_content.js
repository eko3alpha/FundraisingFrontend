'use strict';

var formContentLib = require( './form_content' ),
  objectAssign = require( 'object-assign' ),
  initialState = {
    amount: 0,
    isCustomAmount: false,
    paymentType: '',
    paymentIntervalInMonths: -1, // 0, 1, 3, 6 or 12, 0 = non-recurring payment
    debitType: 'sepa', // sepa and "non-sepa"
    iban: '',
    bic: '',
    accountNumber: '',
    bankCode: '',
    bankName: '',
    addressType: '', // person, firma and anonym
    salutation: 'anrede',
    title: 'vtitle',
    firstName: '',
    lastName: '',
    companyName: '',
    street: '',
    postcode: '',
    city: '',
    country: 'DE',
    email: '',
    confirmSepa: false,
    confirmShortTerm: false,
    confirmNewsletter: false,
    contactPerson: '',
    activePresets: false
  };

module.exports = function donationFormContent( state, action ) {
  if ( typeof state === 'undefined' ) {
    state = initialState;
  }
  switch ( action.type ) {
    case 'INITIALIZE_CONTENT':
      if ( formContentLib.stateContainsUnknownKeys( action.payload, initialState ) ) {
        throw new Error(
          'Initial state contains unknown keys: ' +
          formContentLib.getInvalidKeys( action.payload, initialState ).join( ', ' )
        );
      }
      return objectAssign( {}, state, action.payload );
    default:
      return formContentLib.formContent( state, action );
  }
};

