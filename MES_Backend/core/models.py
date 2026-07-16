from django.db import models

# ==========================================
# BASE MODEL (Abstract - Replaces Triggers)
# ==========================================
class AuditBaseModel(models.Model):
    created_on = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.CharField(max_length=50, null=True, blank=True)
    modified_on = models.DateTimeField(auto_now=True, null=True, blank=True)
    modified_by = models.CharField(max_length=50, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    rowversion_stamp = models.IntegerField(default=1)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if self.pk: 
            self.rowversion_stamp += 1
        super().save(*args, **kwargs)


# ==========================================
# 1. TEXT TRANSLATION
# ==========================================
class TblTextTranslation(AuditBaseModel):
    text_id = models.IntegerField()
    language_id = models.IntegerField(default=1033)
    translation_text = models.TextField()

    class Meta:
        db_table = 'tbl_text_translation'
        unique_together = (('text_id', 'language_id'),)


# ==========================================
# 2. UNIT CHARACTERISTIC
# ==========================================
class TblUnitCharacteristic(AuditBaseModel):
    unit_id = models.IntegerField()
    characteristic = models.CharField(max_length=40)
    value_field = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    attribute_field = models.CharField(max_length=80, null=True, blank=True)

    class Meta:
        db_table = 'tbl_unit_characteristic'
        unique_together = (('unit_id', 'characteristic'),)


# ==========================================
# 3. FACILITY
# ==========================================
class TblFacility(AuditBaseModel):
    facility = models.CharField(max_length=40, primary_key=True)
    company = models.CharField(max_length=40, null=True, blank=True)
    unit_id = models.IntegerField(null=True, blank=True)
    text_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_facility'


# ==========================================
# 4. EQUIPMENT TYPE
# ==========================================
class TblEquipmentType(AuditBaseModel):
    equipment_type = models.SmallIntegerField(primary_key=True)
    text_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_equipment_type'


# ==========================================
# 5. ROLE
# ==========================================
class TblRole(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    role_name = models.CharField(max_length=100)
    text_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_role'


# ==========================================
# 6. REASON TYPE
# ==========================================
class TblReasonType(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    reason_type = models.CharField(max_length=40)
    reason_category = models.CharField(max_length=40)
    text_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_reason_type'


# ==========================================
# 7. SHIFT DEFINITION
# ==========================================
class TblShiftDefinition(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    shift_name = models.CharField(max_length=40)
    shift_start_time = models.DateTimeField()
    shift_end_time = models.DateTimeField()
    shift_sched = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'tbl_shift_definition'


# ==========================================
# 8. PRODUCT
# ==========================================
class TblProduct(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    product_no = models.CharField(max_length=80)
    description = models.CharField(max_length=100, null=True, blank=True)
    traceability = models.CharField(max_length=50, null=True, blank=True)
    text_id = models.IntegerField(null=True, blank=True)
    unit_id = models.IntegerField(null=True, blank=True)
    lot_tracking_code = models.SmallIntegerField()
    serial_tracking_code = models.SmallIntegerField()
    fraction_allowed = models.SmallIntegerField()
    default_uom_code = models.CharField(max_length=20)
    product_inventory_type = models.IntegerField(null=True, blank=True)
    inspection_required = models.BooleanField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_product'


# ==========================================
# 9. WORK CENTER
# ==========================================
class TblWorkCenter(AuditBaseModel):
    work_center = models.CharField(max_length=40, primary_key=True)
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility', null=True, blank=True)
    text_id = models.IntegerField(null=True, blank=True)
    unit_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_work_center'


# ==========================================
# 10. RESOURCE TYPE
# ==========================================
class TblResourceType(AuditBaseModel):
    resource_type = models.OneToOneField(TblEquipmentType, on_delete=models.RESTRICT, primary_key=True, db_column='resource_type')
    text_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_resource_type'


# ==========================================
# 11. REASON CODE
# ==========================================
class TblReasonCode(AuditBaseModel):
    reason_code = models.CharField(max_length=20, primary_key=True)
    description = models.CharField(max_length=100, null=True, blank=True)
    category = models.CharField(max_length=40, null=True, blank=True)
    reason_type_text = models.CharField(max_length=40, null=True, blank=True)
    text_id = models.IntegerField(null=True, blank=True)
    reason_type = models.ForeignKey(TblReasonType, on_delete=models.RESTRICT, db_column='reason_type_id', null=True, blank=True)

    class Meta:
        db_table = 'tbl_reason_code'


# ==========================================
# 12. SHIFT BREAK TYPE
# ==========================================
class TblShiftBreakType(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    shift = models.ForeignKey(TblShiftDefinition, on_delete=models.CASCADE, db_column='shift_id')
    break_type_name = models.CharField(max_length=40)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    class Meta:
        db_table = 'tbl_shift_break_type'


# ==========================================
# 13. PRODUCT COST
# ==========================================
class TblProductCost(AuditBaseModel):
    product = models.OneToOneField(TblProduct, on_delete=models.CASCADE, primary_key=True, db_column='product_id')
    internal_cost = models.DecimalField(max_digits=28, decimal_places=10)
    unit_cost = models.DecimalField(max_digits=28, decimal_places=10)

    class Meta:
        db_table = 'tbl_product_cost'


# ==========================================
# 14. SHIFT PLANNING
# ==========================================
class TblShiftPlanning(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    shift = models.ForeignKey(TblShiftDefinition, on_delete=models.RESTRICT, db_column='shift_id')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    active = models.BooleanField()

    class Meta:
        db_table = 'tbl_shift_planning'


# ==========================================
# 15. RESOURCE (With Option 2 Unique Constraint)
# ==========================================
class TblResource(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    resource_name = models.CharField(max_length=40, unique=True) # Option 2
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    text_id = models.IntegerField(null=True, blank=True)
    resource_type = models.ForeignKey(TblResourceType, on_delete=models.RESTRICT, db_column='resource_type')

    class Meta:
        db_table = 'tbl_resource'


# ==========================================
# 16. EQUIPMENT
# ==========================================
class TblEquipment(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    equipment = models.CharField(max_length=40)
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility', null=True, blank=True)
    text_id = models.IntegerField(null=True, blank=True)
    resource = models.ForeignKey(TblResource, on_delete=models.RESTRICT, db_column='resource_id', null=True, blank=True)
    equipment_type = models.ForeignKey(TblEquipmentType, on_delete=models.RESTRICT, db_column='equipment_type', null=True, blank=True)

    class Meta:
        db_table = 'tbl_equipment'


# ==========================================
# 17. EMPLOYEE
# ==========================================
class TblEmployee(AuditBaseModel):
    is_authenticated = True

    id = models.IntegerField(primary_key=True)
    text_id = models.IntegerField(null=True, blank=True)
    last_name = models.CharField(max_length=100)
    employee_no = models.CharField(max_length=40)
    pass_word = models.CharField(max_length=255)
    resource = models.ForeignKey(TblResource, on_delete=models.RESTRICT, db_column='resource_id')
    employee_valid_date = models.DateTimeField()
    employee_last_login_date = models.DateTimeField(null=True, blank=True)
    employee_last_logout_date = models.DateTimeField(null=True, blank=True)
    personalization_id = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_employee'


# ==========================================
# 18. EMPLOYEE ROLE
# ==========================================
class TblEmployeeRole(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    role = models.ForeignKey(TblRole, on_delete=models.RESTRICT, db_column='role_id')
    employee = models.ForeignKey(TblEmployee, on_delete=models.CASCADE, db_column='employee_id')

    class Meta:
        db_table = 'tbl_employee_role'


# ==========================================
# 19. EMPLOYEE WORKCENTER
# ==========================================
class TblEmployeeWorkcenter(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.CASCADE, db_column='work_center')
    employee = models.ForeignKey(TblEmployee, on_delete=models.CASCADE, db_column='employee_id')

    class Meta:
        db_table = 'tbl_employee_workcenter'


# ==========================================
# 20. RESOURCE COLLECTION (With Option 2 FKs)
# ==========================================
class TblResourceCollection(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    parent_resource_name = models.ForeignKey(
        TblResource, 
        to_field='resource_name', 
        on_delete=models.RESTRICT, 
        db_column='parent_resource_name',
        related_name='child_collections'
    )
    parent_resource_type = models.SmallIntegerField()
    resource_name = models.ForeignKey(
        TblResource, 
        to_field='resource_name', 
        on_delete=models.RESTRICT, 
        db_column='resource_name',
        related_name='parent_collections'
    )
    resource_type = models.SmallIntegerField()

    class Meta:
        db_table = 'tbl_resource_collection'


# ==========================================
# 21. RESOURCE LABOUR
# ==========================================
class TblResourceLabour(AuditBaseModel):
    id = models.CharField(max_length=80, primary_key=True)
    transaction_date = models.DateTimeField()
    scheduled_shift = models.ForeignKey(TblShiftPlanning, on_delete=models.RESTRICT, db_column='scheduled_shift_id')
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    employee = models.ForeignKey(TblEmployee, on_delete=models.RESTRICT, db_column='employee_id')

    class Meta:
        db_table = 'tbl_resource_labour'


# ==========================================
# 22. PRODUCTION
# ==========================================
class TblProduction(AuditBaseModel):
    id = models.CharField(max_length=80, primary_key=True)
    transaction_date = models.DateTimeField()
    scheduled_shift = models.ForeignKey(TblShiftPlanning, on_delete=models.RESTRICT, db_column='scheduled_shift_id')
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    employee = models.ForeignKey(TblEmployee, on_delete=models.RESTRICT, db_column='employee_id')
    product = models.ForeignKey(TblProduct, on_delete=models.RESTRICT, db_column='product_id')
    produce_quantity = models.IntegerField(null=True, blank=True)
    nok_produced_quantity = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_production'


# ==========================================
# 23. NOK PRODUCTION
# ==========================================
class TblNokProduction(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    parent = models.ForeignKey(TblProduction, on_delete=models.CASCADE, db_column='parent_id')
    nok_count = models.IntegerField()
    nok_reason_code = models.ForeignKey(TblReasonCode, on_delete=models.RESTRICT, db_column='nok_reason_code')
    nok_type = models.CharField(max_length=40)

    class Meta:
        db_table = 'tbl_nok_production'


# ==========================================
# 24. PARENT
# ==========================================
class TblParent(AuditBaseModel):
    id = models.CharField(max_length=80, primary_key=True)
    transaction_date = models.DateTimeField()
    scheduled_shift = models.ForeignKey(TblShiftPlanning, on_delete=models.RESTRICT, db_column='scheduled_shift_id')
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    employee = models.ForeignKey(TblEmployee, on_delete=models.RESTRICT, db_column='employee_id')

    class Meta:
        db_table = 'tbl_parent'


# ==========================================
# 25. CUST COMPLAINT
# ==========================================
class TblCustComplaint(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    parent = models.ForeignKey(TblParent, on_delete=models.CASCADE, db_column='parent_id')
    product = models.ForeignKey(TblProduct, on_delete=models.RESTRICT, db_column='product_id')
    reason = models.TextField()
    details = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_cust_complaint'


# ==========================================
# 26. RESOURCE LABOUR DETAIL MODULE
# ==========================================
class TblResourceLabourDetailModule(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    parent = models.ForeignKey(TblResourceLabour, on_delete=models.CASCADE, db_column='parent_id')
    resource = models.ForeignKey(TblResource, on_delete=models.RESTRICT, db_column='resource_id')
    target_cycle_time = models.DecimalField(max_digits=28, decimal_places=10, default=0)

    class Meta:
        db_table = 'tbl_resource_labour_detail_module'


# ==========================================
# 27. RESOURCE LABOUR DETAIL MODULE DOWNTIME
# ==========================================
class TblResourceLabourDetailModuleDowntime(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    parent = models.ForeignKey(TblResourceLabour, on_delete=models.CASCADE, db_column='parent_id')
    resource = models.ForeignKey(TblResource, on_delete=models.RESTRICT, db_column='resource_id')
    reason_code = models.ForeignKey(TblReasonCode, on_delete=models.RESTRICT, db_column='reason_code')
    duration = models.DecimalField(max_digits=28, decimal_places=10)

    class Meta:
        db_table = 'tbl_resource_labour_detail_module_downtime'


# ==========================================
# 28. RESOURCE LABOUR DETAIL WORKSTATION
# ==========================================
class TblResourceLabourDetailWorkstation(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    parent = models.ForeignKey(TblResourceLabour, on_delete=models.CASCADE, db_column='parent_id')
    resource = models.ForeignKey(TblResource, on_delete=models.RESTRICT, db_column='resource_id')
    resource_count = models.IntegerField()
    resource_names = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'tbl_resource_labour_detail_workstation'


# ==========================================
# 29. KPI MODULE
# ==========================================
class TblKpiModule(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    resource = models.ForeignKey(TblResource, on_delete=models.RESTRICT, db_column='resource_id')
    module_name = models.CharField(max_length=40, null=True, blank=True)
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    day_date = models.DateTimeField(null=True, blank=True)
    shift = models.CharField(max_length=40, null=True, blank=True)
    total_downtime = models.CharField(max_length=40, null=True, blank=True)
    running_duration = models.DecimalField(max_digits=28, decimal_places=10)

    class Meta:
        db_table = 'tbl_kpi_module'


# ==========================================
# 30. KPI WORK STATION
# ==========================================
class TblKpiWorkStation(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    resource = models.ForeignKey(TblResource, on_delete=models.RESTRICT, db_column='resource_id')
    station = models.CharField(max_length=40, null=True, blank=True)
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    day_date = models.DateTimeField(null=True, blank=True)
    shift = models.CharField(max_length=40, null=True, blank=True)
    oee = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    oee_target = models.DecimalField(max_digits=26, decimal_places=10, default=100)
    availability = models.DecimalField(max_digits=26, decimal_places=10, null=True, blank=True)
    availability_target = models.DecimalField(max_digits=26, decimal_places=10, default=100)
    performance = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    performance_target = models.DecimalField(max_digits=26, decimal_places=10, null=True, blank=True)
    quality = models.DecimalField(max_digits=26, decimal_places=10, null=True, blank=True)
    quality_target = models.DecimalField(max_digits=26, decimal_places=10, null=True, blank=True)
    to_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tt_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tw_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tn_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tb_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tnb_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    total_downtime = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    running_duration = models.DecimalField(max_digits=28, decimal_places=10)

    class Meta:
        db_table = 'tbl_kpi_work_station'


# ==========================================
# 31. KPI WORK CENTER
# ==========================================
class TblKpiWorkCenter(AuditBaseModel):
    id = models.IntegerField(primary_key=True)
    facility = models.ForeignKey(TblFacility, on_delete=models.RESTRICT, db_column='facility')
    work_center = models.ForeignKey(TblWorkCenter, on_delete=models.RESTRICT, db_column='work_center')
    day_date = models.DateTimeField(null=True, blank=True)
    shift = models.CharField(max_length=40, null=True, blank=True)
    oee = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    oee_target = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    availability = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    availability_target = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    performance = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    performance_target = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    quality = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    quality_target = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    ok_parts = models.IntegerField(null=True, blank=True)
    nok_parts = models.IntegerField(null=True, blank=True)
    to_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tt_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tw_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tn_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tb_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    tnb_val = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    scrap_rate = models.DecimalField(max_digits=28, decimal_places=10, null=True, blank=True)
    total_downtime = models.CharField(max_length=40, null=True, blank=True)
    average_real_takt = models.CharField(max_length=40, null=True, blank=True)

    class Meta:
        db_table = 'tbl_kpi_work_center'


class TblRolePermission(models.Model):
    id = models.AutoField(primary_key=True)
    role = models.ForeignKey(TblRole, on_delete=models.CASCADE, db_column='role_id')
    page_key = models.CharField(max_length=100)

    class Meta:
        db_table = 'tbl_role_permission'
        unique_together = (('role', 'page_key'),)
