export const kilometersToRadian = function(kms:number){
    var earthRadiusInKilometers = 6371;
    return kms / earthRadiusInKilometers;
};