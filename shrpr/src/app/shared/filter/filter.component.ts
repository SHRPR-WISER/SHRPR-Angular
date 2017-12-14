import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

	@Input('courses') courses: any[];
	@Output() onFilter: EventEmitter<any> = new EventEmitter();
	filterForm: FormGroup;
	filtered: any[] = [];
	courseCount: number = 0;
	instructors: any[] = [];

  constructor() {}

  ngOnInit() {

  	//for each course, sort data
  	for(let course of this.courses){

  		//add to instructor array
  		this.instructors.push(course.instructor);
  	}

  	//get count
  	this.courseCount = this.courses.length;

  	//create form
    this.filterForm = new FormGroup({
      'fun': new FormControl(true),
      'work': new FormControl(true),
      'kids': new FormControl(true)
    });
 
    //subscribe to changes
    this.filterForm.valueChanges.subscribe(  
      (form: any) => this.filter(form)
    );
  }

  filter(form: any) {

  	//for each course, add to filtered array
		for(let course of this.courses){

			//check group
			switch (course.group.id) {
				case 1:
					if(!form.fun) continue;
					break;

				case 2:
					if(!form.work) continue;
					break;

				case 3:
					if(!form.kids) continue;
					break;
  		}

  		//add to filtered array
  		this.filtered.push(course);
  	}

  	//get count
  	this.courseCount = this.filtered.length;
  }
}