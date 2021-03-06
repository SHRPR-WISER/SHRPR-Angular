import { Component, OnInit, Output, ViewChild, ElementRef, NgModule, Renderer, NgZone, Input, EventEmitter } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, NgForm, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { CompleterService, CompleterData, CompleterItem, CompleterCmp } from 'ng2-completer';
import * as moment from 'moment';
import { Router } from "@angular/router";
import { ValidationService } from '../../../core/validation.service';
import { AgmCoreModule, MapsAPILoader } from '@agm/core';

import { Instructor } from '../../../instructor/instructor.interface';
import { InstructorService } from '../../../instructor/instructor.service';
import { User } from '../../../core/user.interface';

@Component({
  selector: 'add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css']
})
export class AddCourseComponent implements OnInit {

  @Input('user') user: User;
  
  instructorCourseForm: FormGroup;
  semesterInfoForm: FormGroup;
  
  semesterDetailForm: FormGroup;
  sessionArray: any[] = [];
  meetingArray: any[] = [];
  detailsData: any[] = [];
  data: any = {};
  semesterInfo: any = {};
  
  courseImages:any = {};
  
  //sessionArray: Array<{sessionDate:string, startTime: string, endTime: string}>;
  //private sessionArray = new Array<{sessionDate:string}>();

  @ViewChild('panel') panel : ElementRef;
  @ViewChild('myForm') myForm: ElementRef;

  @ViewChild("search") public searchElementRef: ElementRef;
  searchControl: FormControl;
  location: string = '';
  dataService: CompleterData;

  
  slideNo: number = 1;
  lastSlideNo:number = 3;
  prevPos: string = '';
  nextPos:number = 0;
  goNext:boolean = false;
  
  courseStartTimeText:string;
  courseSessionNumber:number;
  courseDurationNumber:number;
  courseFeeText:number;
  dt:Date;

  city: string;
  state: string;
  zip: string;
  country: string;

  constructor(
    public renderer: Renderer,
    private fb: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private router: Router
  ) { }

  ngOnInit() {

    this.instructorCourseForm = this.fb.group({
      'courseTitleText': ['', Validators.required],
      'courseGroupSelect': ['', Validators.required],
      'courseCategorySelect': ['', Validators.required],
      'courseSubCategorySelect': ['', Validators.required],
      'courseDescriptionText': ['', [Validators.required, Validators.minLength(40)]]
    });  
    this.semesterInfoForm = this.fb.group({  
      'courseStartDateText': ['', Validators.required],
      'courseIteration' : ['', Validators.required],
      'courseStartTimeText': ['', Validators.required],
      'courseEndTimeText': [''],
      'courseSessionNumber': ['', Validators.required],
      'courseDurationNumber': ['', Validators.required],
      'courseFeeText': ['', Validators.required],
      'searchControl': [''],
      'coursePrimaryPhoto': [''],
      'courseSecondaryPhoto' : [''] 
       
    });
    
    //console.log(this.instructors.id)
   
    this.searchControl = new FormControl();
    this.setCurrentPosition();
    this.goNext = this.instructorCourseForm.valid;

    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });

      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          
          this.location = place.formatted_address; 
          var components = place.address_components;
          this.city = '';
          this.state = '';
          this.zip = '';
          this.country = '';
          var component,
          i, l, x, y;
          for(i = 0, l = components.length; i < l; ++i){
                  //store component
                  component = components[i];
                  //check each type
                  for(x = 0, y = component.types.length; x < y; ++ x){
                    //depending on type, assign to var
                    switch(component.types[x]){
                      case 'neighborhood':
                      this.city = component.long_name;
                      break;
                      case 'administrative_area_level_1':
                      this.state = component.short_name;
                      break;
                      case 'postal_code':
                      this.zip = component.short_name;
                      break;
                      case 'country':
                      this.country = component.short_name;
                      break;
                    }
                  }
                }
        });
      });
    });

    this.semesterDetailForm = new FormGroup({  
      
    });

  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        //this.latitude = position.coords.latitude;
        //this.longitude = position.coords.longitude;
        //this.zoom = 12;
        //this.location = position;
        //console.log(position);
        
      });
    }
  }

  nextSlide(){
    if(this.slideNo == 1){
      this.instructorCourseSubmit();
    }
    if(this.slideNo == 2){
      this.sessionDetailsinit();
    }
    if(this.slideNo == 2){
      this.sessionDetailsinit();
    }
    if(this.slideNo == 3){
      this.submitAllFormData();
    }
   
    if( this.slideNo > 0 && this.slideNo < this.lastSlideNo ){
      this.slideNo++;
      this.renderer.setElementStyle(
      this.panel.nativeElement, 
      'transform', 
      'translateX(-' + String((this.slideNo-1) * 100) + '%)');
    }
  }

  prevSlide(){
      if( this.slideNo >= 2 ){
        this.slideNo--;
        this.renderer.setElementStyle(
        this.panel.nativeElement, 
        'transform', 
        'translateX(-' + String((this.slideNo-1) * 100) + '%)');
      }
      else{
        this.renderer.setElementStyle(
          this.panel.nativeElement, 
          'transform', 
          'translateX(0px)');
      }
    }

  instructorCourseSubmit() {
      let groupText: Array<{id: number, label: string}> = [];
      let categoryText: Array<{id: number, name: string, parent: number}> = [];
      let instructorText: Array<{id: number, name: string, email: string}> = [];

      this.user.id
      
      this.data.title = this.instructorCourseForm.value.courseTitleText;

      instructorText.push({
        "id" : this.user.id,
        "name" : this.user.name,
        "email" : this.user.email
      });

      this.data.instructor = instructorText;
      
      let grouptid = this.instructorCourseForm.value.courseGroupSelect;
      
      let parentId =  this.instructorCourseForm.value.courseCategorySelect;
      categoryText.push(
        {
          "id" : this.instructorCourseForm.value.courseSubCategorySelect,
          "name" : '',
          "parent" : parentId 
        }
      );
      this.data.categories = categoryText;

      groupText.push(
        {
          "id" : grouptid,
          "label" : ''
        }
      );
      this.data.group = groupText;

      this.data.description = this.instructorCourseForm.value.courseDescriptionText;
      //console.log(this.data);
        
    } 
  
  
  sessionDetailsinit(){
    
    if(this.sessionArray.length !== 0) {
        this.sessionArray = [];
    }

    let semesterData: Array<{amount: number, duration: number, start_date: string, end_date: string, addresses: any, meetings: any, primary_img: string, details : any }> = [];
    let meetingData: Array<{substitute: string, start: string, end: string }>;
    
    
    let courseStartDateText = this.semesterInfoForm.value.courseStartDateText;
    let courseIteration = this.semesterInfoForm.value.courseIteration;
    let courseStartTimeText = this.semesterInfoForm.value.courseStartTimeText;
    let courseEndTimeText = this.semesterInfoForm.value.courseEndTimeText;
    this.courseSessionNumber = this.semesterInfoForm.value.courseSessionNumber;
    let courseDurationNumber = this.semesterInfoForm.value.courseDurationNumber;
    let searchControl = this.semesterInfoForm.value.searchControl;
    let primaryPhoto = this.semesterInfoForm.value.coursePrimaryPhoto;
    let secondaryPhoto = this.semesterInfoForm.value.courseSecondaryPhoto;
    //this.courseFeeText = this.semesterInfoForm.value.courseFeeText;
    
    courseStartTimeText = moment(courseStartTimeText+':00', 'hh:mm:ss a');
    courseStartTimeText = moment(courseStartTimeText).format('HH:MM');
    courseEndTimeText = moment(courseStartTimeText, 'LT').add(courseDurationNumber, 'hours');
    courseEndTimeText = moment(courseEndTimeText).format('HH:MM');
    courseStartDateText = moment(courseStartDateText).format('YYYY-MM-DD');
    this.sessionArray.push(
      {
        "sessionDate" : courseStartDateText, 
        "startTime" : courseStartTimeText, 
        "endTime" : courseEndTimeText
      }
    );
    for(var i = 0; i < this.courseSessionNumber-1; i++){
      courseStartDateText = moment(courseStartDateText, 'YYYY-MM-DD').add(1, courseIteration).calendar();
      courseStartDateText = moment(courseStartDateText).format('YYYY-MM-DD');
      this.sessionArray.push(
        {
        "sessionDate" : courseStartDateText, 
        "startTime" : courseStartTimeText, 
        "endTime" : courseEndTimeText
        }
      );
    }
    let startdate = this.semesterInfoForm.value.courseStartDateText + ' ' + this.semesterInfoForm.value.courseStartTimeText;
    let enddate = this.sessionArray[this.sessionArray.length-1].sessionDate + ' ' + this.sessionArray[this.sessionArray.length-1].endTime;
    if(this.meetingArray.length > 0){
      for(var k =0, l = this.meetingArray.length; k < l; k++){
        this.meetingArray.pop(); 
      }  
    }
    for(var p = 0, q = this.sessionArray.length; p < q; p++){
      
      let startdt = this.sessionArray[p].sessionDate+' '+this.sessionArray[p].startTime;
      let enddt = this.sessionArray[p].sessionDate+' '+this.sessionArray[p].endTime;
      
      this.meetingArray.push(
        {
          "substitute" : null,
          "start" : startdt,
          "end" : enddt
        }
      );
    }
    if(this.detailsData.length > 0){
      for(var k =0, l = this.detailsData.length; k < l; k++){
        this.detailsData.pop(); 
      }  
    }
    this.detailsData.push(
      {
         "secondary_img" : secondaryPhoto
      }
    );
   
    semesterData.push(
      {
        "amount" : this.semesterInfoForm.value.courseFeeText, 
        "duration" : this.courseSessionNumber, 
        "start_date": startdate, 
        "end_date": enddate, 
        "addresses": '', 
        "meetings": this.meetingArray,
        "primary_img" : primaryPhoto,
        "details" : this.detailsData
      }
    );
    this.data.semesters = semesterData
  }  
  submitAllFormData(){
    console.log(this.data);
  }
}
