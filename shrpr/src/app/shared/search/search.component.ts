import { Component, OnInit, NgZone, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompleterService, CompleterData, CompleterItem, CompleterCmp } from 'ng2-completer';
import { NgModel } from '@angular/forms';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { environment } from '../../../environments/environment';
import {} from '@types/googlemaps';

declare var google: any;

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  @ViewChild("search") searchElementRef: ElementRef;
  api: string = environment.api;
  searchControl: FormControl;
  location: string = '';
  dataService: CompleterData;
  
  constructor(
    private ref: ChangeDetectorRef,
    private completerService: CompleterService,
    private mapsAPILoader: MapsAPILoader,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {

    this.dataService = this.completerService.remote(
      this.api + 'search?str=', 
      'title', 
      'title'
    ).imageField('img');

    //get location
    this.location = localStorage.getItem('location');

    if(navigator.geolocation) { //check if we can get lat/lng
      
      //create location
      navigator.geolocation.getCurrentPosition(position => {

        let lat = position.coords.latitude;
        let lng = position.coords.longitude;

        let geocoder = new google.maps.Geocoder();
        let latlng = new google.maps.LatLng(lat, lng);

        //reverse geocode
        geocoder.geocode({ 'location': latlng }, (results, status) => {

          if (status == google.maps.GeocoderStatus.OK) {

            if (results[0] != null) {

              //get location
              this.location = this.findLocation(results[0].address_components);

              //set location
              localStorage.setItem('location', this.location);

              //refresh
              this.ref.detectChanges();
            }
          }
        });
      });
    }

    //create search FormControl
    this.searchControl = new FormControl();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['geocode']
      });

      autocomplete.addListener('place_changed', () => {

        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
  
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
        });
      });
    });
  }

  findLocation(components){

    var city: string = '',
        state: string = '',
        zip: string = '',
        country: string = '',
        component,
        i, l, x, y;

    for(i = 0, l = components.length; i < l; ++i){

      //store component
      component = components[i];

      //check each type
      for(x = 0, y = component.types.length; x < y; ++ x){

        //depending on type, assign to var
        switch(component.types[x]){

          case 'neighborhood':
          city = component.long_name;
          break;

          case 'administrative_area_level_1':
          state = component.short_name;
          break;

          case 'postal_code':
          zip = component.short_name;
          break;

          case 'country':
          country = component.short_name;
          break;
        }
      }
    }

    //set country
    if(country){

      //set local storage
      localStorage.setItem('country', country);
    }

    if(city && state && zip){

      //set local storage
      localStorage.setItem('city', city);
      localStorage.setItem('state', state);
      localStorage.setItem('zip', zip);

      return city + ', ' + state + ' ' + zip;
    }
    else if (city && state) { 

      //set local storage
      localStorage.setItem('city', city);
      localStorage.setItem('state', state);

      return city + ', ' + state;
    } else {

      return '';
    }
  }

  onSelected(item: CompleterItem) {

    let type;
    let id;
    let url;

    if(item){

      type = item.originalObject.type;
      id = item.originalObject.id;

      //if course selected
      if(type == 'course'){

        //navigate to course
        this.router.navigate(['courses', id]);
      }
    }
  }

  submit() {

    let location = this.searchElementRef.nativeElement.value;

    if( location.indexOf('Hartford') >= 0 ){

      this.router.navigate(['courses', 1]);
    }
    else if( location.indexOf('Orange') >= 0 ){

      this.router.navigate(['courses', 2]);
    }
    else{

      this.router.navigate(['courses', 'list', 'all']);
    }
  }
}